import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase-server";

/**
 * GET /api/exercises
 * List all active exercise templates with the current user's completion status.
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient();

    // Fetch templates and user responses in parallel
    const [templatesResult, responsesResult] = await Promise.all([
      serviceClient
        .from("exercise_templates")
        .select(
          "id, slug, name, description, category, journey_stages, display_order, is_required, estimated_minutes"
        )
        .eq("is_active", true)
        .order("display_order"),

      serviceClient
        .from("user_exercise_responses")
        .select("exercise_id, status, version, completed_at")
        .eq("user_id", user.id)
        .order("version", { ascending: false }),
    ]);

    if (templatesResult.error) throw templatesResult.error;

    const templates = templatesResult.data || [];
    const responses = responsesResult.data || [];

    // Build response map: exercise_id -> latest response
    const responseMap = new Map<
      string,
      { status: string; version: number; completedAt: string | null }
    >();
    for (const resp of responses) {
      if (!responseMap.has(resp.exercise_id)) {
        responseMap.set(resp.exercise_id, {
          status: resp.status,
          version: resp.version,
          completedAt: resp.completed_at,
        });
      }
    }

    // Merge templates with user status
    const exercises = templates.map((t) => {
      const userResp = responseMap.get(t.id);
      return {
        ...t,
        userStatus: userResp?.status || "not_started",
        userVersion: userResp?.version || 0,
        completedAt: userResp?.completedAt || null,
      };
    });

    return NextResponse.json({
      exercises,
      summary: {
        total: exercises.length,
        completed: exercises.filter((e) => e.userStatus === "completed").length,
        inProgress: exercises.filter((e) => e.userStatus === "in_progress")
          .length,
        notStarted: exercises.filter((e) => e.userStatus === "not_started")
          .length,
      },
    });
  } catch (error) {
    console.error("Exercises list error:", error);
    return NextResponse.json(
      { error: "Failed to load exercises" },
      { status: 500 }
    );
  }
}
