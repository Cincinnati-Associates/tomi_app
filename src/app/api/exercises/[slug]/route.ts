import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase-server";
import { computeExerciseScore } from "@/lib/exercise-scoring";
import { propagateExerciseToFields } from "@/lib/exercise-field-mapping";

/**
 * GET /api/exercises/[slug]
 * Fetch an exercise template with schema, the user's existing response (if any),
 * and prefill hints from their journey/other exercises.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const serviceClient = createServiceRoleClient();

    // Fetch template, user response, and journey in parallel
    const [templateResult, responseResult, journeyResult] = await Promise.all([
      serviceClient
        .from("exercise_templates")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single(),

      serviceClient
        .from("user_exercise_responses")
        .select("*")
        .eq("user_id", user.id)
        .order("version", { ascending: false })
        .limit(10), // Get all versions, filter by exercise_id after

      serviceClient
        .from("user_journeys")
        .select("*")
        .eq("user_id", user.id)
        .single(),
    ]);

    if (templateResult.error || !templateResult.data) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    const template = templateResult.data;

    // Filter responses for this exercise
    const exerciseResponses = (responseResult.data || []).filter(
      (r) => r.exercise_id === template.id
    );
    const latestResponse = exerciseResponses[0] || null;

    // Build prefill hints from journey data
    const journey = journeyResult.data;
    const prefill: Record<string, unknown> = {};

    if (journey) {
      // Map journey fields back to exercise question keys
      if (journey.target_timeline && slug === "timeline_commitment") {
        prefill.timeline = journey.target_timeline;
      }
      if (journey.co_buyer_status && slug === "timeline_commitment") {
        prefill.cobuyer_status = journey.co_buyer_status;
      }
      if (
        journey.target_markets &&
        Array.isArray(journey.target_markets) &&
        journey.target_markets.length > 0 &&
        slug === "housing_preferences"
      ) {
        prefill.target_metros = journey.target_markets;
      }
    }

    return NextResponse.json({
      template: {
        id: template.id,
        slug: template.slug,
        name: template.name,
        description: template.description,
        category: template.category,
        schema: template.schema,
        scoringRules: template.scoring_rules,
        estimatedMinutes: template.estimated_minutes,
        isRequired: template.is_required,
      },
      response: latestResponse
        ? {
            id: latestResponse.id,
            responses: latestResponse.responses,
            computedScores: latestResponse.computed_scores,
            status: latestResponse.status,
            version: latestResponse.version,
            startedAt: latestResponse.started_at,
            completedAt: latestResponse.completed_at,
          }
        : null,
      prefill,
      canRetake:
        latestResponse?.status === "completed",
    });
  } catch (error) {
    console.error("Exercise GET error:", error);
    return NextResponse.json(
      { error: "Failed to load exercise" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exercises/[slug]
 * Save or complete an exercise response.
 *
 * Body: {
 *   responses: Record<string, unknown>,  // question key -> answer value
 *   status: 'in_progress' | 'completed',
 *   retake?: boolean                      // start a new version
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const body = await request.json();
    const {
      responses,
      status = "in_progress",
      retake = false,
    } = body as {
      responses: Record<string, unknown>;
      status?: "in_progress" | "completed";
      retake?: boolean;
    };

    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { error: "responses object is required" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Fetch the template
    const { data: template, error: templateError } = await serviceClient
      .from("exercise_templates")
      .select("id, slug, scoring_rules, schema")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Get latest version for this user + exercise
    const { data: existingResponses } = await serviceClient
      .from("user_exercise_responses")
      .select("id, version, status")
      .eq("user_id", user.id)
      .eq("exercise_id", template.id)
      .order("version", { ascending: false })
      .limit(1);

    const existing = existingResponses?.[0];
    let version = existing?.version || 1;

    // If retaking, increment version
    if (retake && existing?.status === "completed") {
      version = existing.version + 1;
    }

    // Compute scores if completing
    let computedScores: Record<string, unknown> = {};
    if (status === "completed" && template.scoring_rules) {
      computedScores = computeExerciseScore(
        template.scoring_rules as Record<string, unknown>,
        template.schema as Record<string, unknown>,
        responses
      );
    }

    // Upsert the response
    const now = new Date().toISOString();
    const responseData = {
      user_id: user.id,
      exercise_id: template.id,
      responses,
      computed_scores: computedScores,
      status,
      started_at: existing && !retake ? undefined : now,
      completed_at: status === "completed" ? now : null,
      version,
      updated_at: now,
    };

    let result;

    if (existing && !retake) {
      // Update existing response
      result = await serviceClient
        .from("user_exercise_responses")
        .update({
          responses: responseData.responses,
          computed_scores: responseData.computed_scores,
          status: responseData.status,
          completed_at: responseData.completed_at,
          updated_at: responseData.updated_at,
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // Insert new response (new exercise or retake)
      result = await serviceClient
        .from("user_exercise_responses")
        .insert({
          user_id: responseData.user_id,
          exercise_id: responseData.exercise_id,
          responses: responseData.responses,
          computed_scores: responseData.computed_scores,
          status: responseData.status,
          started_at: now,
          completed_at: responseData.completed_at,
          version: responseData.version,
          updated_at: now,
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    // On completion: propagate fields and update readiness score
    if (status === "completed") {
      // Fire-and-forget: propagate exercise answers to journey/profile fields
      propagateExerciseToFields(user.id, slug, responses).catch((err) =>
        console.error("Field propagation error:", err)
      );

      // Update readiness score
      updateReadinessScore(user.id, serviceClient).catch((err) =>
        console.error("Readiness score update error:", err)
      );
    }

    return NextResponse.json({
      response: {
        id: result.data.id,
        responses: result.data.responses,
        computedScores: result.data.computed_scores,
        status: result.data.status,
        version: result.data.version,
        startedAt: result.data.started_at,
        completedAt: result.data.completed_at,
      },
    });
  } catch (error) {
    console.error("Exercise POST error:", error);
    return NextResponse.json(
      { error: "Failed to save exercise response" },
      { status: 500 }
    );
  }
}

/**
 * Recalculate the user's readiness score from all completed exercises.
 */
async function updateReadinessScore(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceClient: any
) {
  // Get all completed exercises with their template scoring rules
  const { data: completedResponses } = await serviceClient
    .from("user_exercise_responses")
    .select("exercise_id, computed_scores, version")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("version", { ascending: false });

  if (!completedResponses || completedResponses.length === 0) return;

  const { data: templates } = await serviceClient
    .from("exercise_templates")
    .select("id, scoring_rules")
    .eq("is_active", true);

  if (!templates) return;

  // Build template map
  const templateMap = new Map<string, Record<string, unknown>>();
  for (const t of templates) {
    templateMap.set(t.id, t.scoring_rules as Record<string, unknown>);
  }

  // Deduplicate by exercise_id (latest version)
  const seen = new Set<string>();
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const resp of completedResponses) {
    if (seen.has(resp.exercise_id)) continue;
    seen.add(resp.exercise_id);

    const rules = templateMap.get(resp.exercise_id);
    if (!rules) continue;

    const readinessWeight =
      (rules.readinessWeight as number) || 0;
    const maxScore = (rules.maxScore as number) || 100;
    const scores = resp.computed_scores as Record<string, unknown>;
    const total = (scores?.total as number) || 0;

    // Normalize score to 0-100
    const normalized = Math.min(100, Math.round((total / maxScore) * 100));

    totalWeightedScore += normalized * readinessWeight;
    totalWeight += readinessWeight;
  }

  const readinessScore =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  // Update or create journey
  const { data: journey } = await serviceClient
    .from("user_journeys")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (journey) {
    await serviceClient
      .from("user_journeys")
      .update({ readiness_score: readinessScore, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  } else {
    await serviceClient.from("user_journeys").insert({
      user_id: userId,
      readiness_score: readinessScore,
    });
  }
}
