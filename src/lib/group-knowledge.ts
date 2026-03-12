/**
 * Group Knowledge Assembler
 *
 * Builds the knowledge context for the group Homi (collaborative agent).
 * This is the PRIVACY BOUNDARY — it determines exactly what individual
 * data is visible in the group chat context.
 *
 * Design principles:
 * 1. No individual data enters group context without explicit opt-in
 * 2. Exercise answers are NEVER shared — only completion status
 * 3. Financial data requires explicit sharing via partyMemberSharedData
 * 4. Assessment details stay private — only grade (A/B/C/D) is shown
 * 5. Private Homi chat history never enters group context
 * 6. Shared data is revocable (pre-agreement stage)
 *
 * Three data layers:
 * - Layer 1 (PRIVATE):  Assessment answers, exercise free text, income,
 *                        budget, credit, feelings about co-buyers, chat history
 * - Layer 2 (DERIVED):  Exercise completion status, readiness stage, assessment
 *                        grade, dimension strengths — safe aggregates
 * - Layer 3 (SHARED):   Party info, member names, group decisions, explicitly
 *                        opted-in data from partyMemberSharedData
 *
 * See: docs/GROUP_KNOWLEDGE_ARCHITECTURE.md
 */

import { createServiceRoleClient } from "./supabase-server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GroupMemberContext {
  userId: string;
  name: string;
  avatarUrl: string | null;
  partyRole: string; // "admin" | "member"
  joinedAt: string;

  // Layer 2: Safe derivatives (always included)
  readinessStage: string; // "exploring" | "preparing" | "ready" etc — NOT the score
  exerciseProgress: {
    completed: number;
    total: number;
    completedSlugs: string[]; // which exercises, not their answers
  };
  assessmentGrade: string | null; // A/B/C/D only, no score or insights

  // Layer 3: Explicitly shared data (only if opted in)
  sharedData: Record<string, unknown>; // keyed by data_key
}

export interface GroupKnowledge {
  // Party context
  party: {
    id: string;
    name: string;
    status: string;
    targetCity: string | null;
    targetBudget: number | null;
    createdAt: string;
  };

  // All members with their safe context
  members: GroupMemberContext[];

  // Summary stats
  memberCount: number;
  allExercisesComplete: boolean; // true if every member finished all exercises

  // Data sources used
  dataSources: string[];
}

// ---------------------------------------------------------------------------
// Assembler
// ---------------------------------------------------------------------------

/**
 * Assemble group knowledge for the collaborative Homi.
 *
 * This function is the single source of truth for what the group agent knows.
 * It NEVER queries individual exercise responses, assessment details,
 * private chat history, or financial data that hasn't been explicitly shared.
 */
export async function assembleGroupKnowledge(
  partyId: string
): Promise<GroupKnowledge | null> {
  const supabase = createServiceRoleClient();
  const dataSources: string[] = [];

  // Run all queries in parallel
  const [partyResult, membersResult, templatesResult, sharedDataResult] =
    await Promise.all([
      // 1. Party info
      supabase
        .from("buying_parties")
        .select("id, name, status, target_city, target_budget, created_at")
        .eq("id", partyId)
        .single(),

      // 2. Members with profiles and journey state
      supabase
        .from("party_members")
        .select(`
          id,
          user_id,
          role,
          invite_status,
          joined_at,
          profiles!inner (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("party_id", partyId)
        .eq("invite_status", "accepted"),

      // 3. Active exercise templates (for completion tracking)
      supabase
        .from("exercise_templates")
        .select("id, slug")
        .eq("is_active", true),

      // 4. Explicitly shared data for this party's members
      supabase
        .from("party_member_shared_data")
        .select("party_member_id, data_key, data_value")
        .is("revoked_at", null)
        .in(
          "party_member_id",
          // We'll filter this after we get member IDs — for now get all
          // This subquery approach works because RLS is bypassed with service role
          (await supabase
            .from("party_members")
            .select("id")
            .eq("party_id", partyId)
            .eq("invite_status", "accepted")
          ).data?.map((m) => m.id) || []
        ),
    ]);

  const party = partyResult.data;
  if (!party) return null;

  dataSources.push("party");

  const members = membersResult.data || [];
  const templates = templatesResult.data || [];
  const sharedData = sharedDataResult.data || [];

  // Build shared data lookup: partyMemberId -> { dataKey: dataValue }
  const sharedDataByMember = new Map<string, Record<string, unknown>>();
  for (const row of sharedData) {
    if (!sharedDataByMember.has(row.party_member_id)) {
      sharedDataByMember.set(row.party_member_id, {});
    }
    sharedDataByMember.get(row.party_member_id)![row.data_key] = row.data_value;
  }

  if (sharedData.length > 0) {
    dataSources.push("shared_data");
  }

  // Get user IDs for journey + exercise queries
  const userIds = members.map((m) => m.user_id);

  // Query journey stages and exercise completion STATUS (not answers) in parallel
  const [journeysResult, exerciseStatusResult] = await Promise.all([
    // Journey stages only — no budget, no detailed preferences
    supabase
      .from("user_journeys")
      .select("user_id, stage")
      .in("user_id", userIds),

    // Exercise completion STATUS only — no responses, no computed_scores
    supabase
      .from("user_exercise_responses")
      .select("user_id, exercise_id, status")
      .in("user_id", userIds)
      .eq("status", "completed"),
  ]);

  const journeys = journeysResult.data || [];
  const exerciseCompletions = exerciseStatusResult.data || [];

  if (journeys.length > 0) dataSources.push("journey_stages");
  if (exerciseCompletions.length > 0) dataSources.push("exercise_status");

  // Build lookup maps
  const journeyByUser = new Map<string, string>();
  for (const j of journeys) {
    journeyByUser.set(j.user_id, j.stage);
  }

  const templateSlugById = new Map<string, string>();
  for (const t of templates) {
    templateSlugById.set(t.id, t.slug);
  }

  // Exercise completions per user
  const completionsByUser = new Map<string, Set<string>>();
  for (const ec of exerciseCompletions) {
    if (!completionsByUser.has(ec.user_id)) {
      completionsByUser.set(ec.user_id, new Set());
    }
    const slug = templateSlugById.get(ec.exercise_id);
    if (slug) {
      completionsByUser.get(ec.user_id)!.add(slug);
    }
  }

  // Query assessment grades — ONLY the grade letter, nothing else
  const assessmentGrades = new Map<string, string>();
  const visitorLinksResult = await supabase
    .from("visitor_user_links")
    .select("user_id, merged_context")
    .in("user_id", userIds);

  for (const link of visitorLinksResult.data || []) {
    const ctx = link.merged_context as Record<string, unknown> | null;
    const assessment = ctx?.assessmentData as Record<string, unknown> | null;
    if (assessment?.grade) {
      assessmentGrades.set(link.user_id, assessment.grade as string);
    }
  }

  if (assessmentGrades.size > 0) dataSources.push("assessment_grades");

  // Assemble member contexts
  const memberContexts: GroupMemberContext[] = members.map((m) => {
    const profile = m.profiles as unknown as {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
    const completedSlugs = Array.from(
      completionsByUser.get(m.user_id) || new Set<string>()
    );

    return {
      userId: m.user_id,
      name: profile.full_name || "Unknown",
      avatarUrl: profile.avatar_url,
      partyRole: m.role,
      joinedAt: m.joined_at,

      // Layer 2: Safe derivatives
      readinessStage: journeyByUser.get(m.user_id) || "exploring",
      exerciseProgress: {
        completed: completedSlugs.length,
        total: templates.length,
        completedSlugs,
      },
      assessmentGrade: assessmentGrades.get(m.user_id) || null,

      // Layer 3: Explicitly shared
      sharedData: sharedDataByMember.get(m.id) || {},
    };
  });

  const allComplete = memberContexts.every(
    (m) => m.exerciseProgress.completed >= m.exerciseProgress.total && m.exerciseProgress.total > 0
  );

  return {
    party: {
      id: party.id,
      name: party.name,
      status: party.status,
      targetCity: party.target_city,
      targetBudget: party.target_budget ? Number(party.target_budget) : null,
      createdAt: party.created_at,
    },
    members: memberContexts,
    memberCount: memberContexts.length,
    allExercisesComplete: allComplete,
    dataSources,
  };
}

// ---------------------------------------------------------------------------
// Prompt Formatter
// ---------------------------------------------------------------------------

/**
 * Format GroupKnowledge into a system prompt section for the group Homi.
 *
 * This is deliberately separate from formatKnowledgeForPrompt (individual)
 * to enforce the privacy boundary at the formatting layer too.
 */
export function formatGroupKnowledgeForPrompt(
  knowledge: GroupKnowledge,
  currentUserId: string
): string {
  const lines: string[] = [];

  lines.push(
    `## Group Knowledge`,
    `Use this to understand the group context. This data comes from what members`,
    `have shared and their journey progress. NEVER speculate about data you don't have.`,
    `If financial details aren't shown for a member, they haven't shared them yet —`,
    `do NOT ask them to share in the group chat. They can share when ready.`,
    ``,
    `[BEGIN GROUP DATA]`,
    ``
  );

  // Party context
  lines.push(`### Party`);
  lines.push(`- **Name**: ${knowledge.party.name}`);
  lines.push(`- **Status**: ${knowledge.party.status}`);
  if (knowledge.party.targetCity) {
    lines.push(`- **Target area**: ${knowledge.party.targetCity}`);
  }
  if (knowledge.party.targetBudget) {
    lines.push(
      `- **Group target budget**: $${(knowledge.party.targetBudget / 1000).toFixed(0)}k`
    );
  }
  lines.push(``);

  // Members
  lines.push(`### Members`);
  for (const member of knowledge.members) {
    const isCurrent = member.userId === currentUserId;
    const tag = isCurrent ? " ← you" : "";

    lines.push(`**${member.name}**${tag} (${member.partyRole})`);
    lines.push(`  - Stage: ${member.readinessStage}`);
    lines.push(
      `  - Exercises: ${member.exerciseProgress.completed}/${member.exerciseProgress.total} complete`
    );
    if (member.exerciseProgress.completedSlugs.length > 0) {
      lines.push(
        `  - Completed: ${member.exerciseProgress.completedSlugs.map((s) => s.replace(/_/g, " ")).join(", ")}`
      );
    }
    if (member.assessmentGrade) {
      lines.push(`  - Assessment: Grade ${member.assessmentGrade}`);
    }

    // Shared data (only if the member has opted in)
    const sharedKeys = Object.keys(member.sharedData);
    if (sharedKeys.length > 0) {
      lines.push(`  - Shared info:`);
      for (const key of sharedKeys) {
        const value = member.sharedData[key];
        lines.push(`    - ${formatSharedDataLabel(key)}: ${formatSharedDataValue(key, value)}`);
      }
    }

    lines.push(``);
  }

  // Group alignment summary
  if (knowledge.allExercisesComplete) {
    lines.push(`### Group Status`);
    lines.push(`All members have completed their individual exercises.`);
    lines.push(``);
  }

  lines.push(`[END GROUP DATA]`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSharedDataLabel(key: string): string {
  const labels: Record<string, string> = {
    budget_range: "Budget range",
    down_payment: "Down payment capacity",
    monthly_limit: "Monthly payment limit",
    income_range: "Income range",
    credit_tier: "Credit tier",
    timeline: "Timeline",
    location_preferences: "Location preferences",
    property_type: "Property type",
    deal_breakers: "Deal breakers",
    ownership_split: "Preferred ownership split",
    exit_preferences: "Exit preferences",
  };
  return labels[key] || key.replace(/_/g, " ");
}

function formatSharedDataValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "Not specified";

  const v = value as Record<string, unknown>;

  switch (key) {
    case "budget_range":
      return `$${((v.low as number) / 1000).toFixed(0)}k – $${((v.high as number) / 1000).toFixed(0)}k`;
    case "down_payment":
    case "monthly_limit":
      return `$${((v.amount as number) / 1000).toFixed(0)}k`;
    case "income_range":
      return v.range as string;
    case "credit_tier":
      return v.tier as string;
    case "timeline":
      return v.value as string;
    case "location_preferences":
      return (v.areas as string[]).join(", ");
    case "property_type":
      return (v.types as string[]).join(", ");
    case "deal_breakers":
      return (v.items as string[]).join(", ");
    case "ownership_split":
      return `${v.percentage}%`;
    case "exit_preferences":
      return `${v.notice_period} notice, ${v.buyout_method} buyout`;
    default:
      return JSON.stringify(value);
  }
}
