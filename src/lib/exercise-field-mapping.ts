/**
 * Exercise Field Mapping & Propagation
 *
 * Declarative mapping from exercise responses to journey/profile fields.
 * When an exercise is completed, relevant answers auto-populate the user's
 * journey record (and optionally profile) — but only if the target field
 * is currently null (no overwrite of user-set values by default).
 */

import { createServiceRoleClient } from "./supabase-server";

export interface FieldMapping {
  exerciseSlug: string;
  questionKey: string;
  targetTable: "user_journeys" | "profiles";
  targetField: string;
  transform?: (value: unknown) => unknown;
  /** If false (default), only set field when current value is null */
  overwriteExisting: boolean;
}

/**
 * Mapping config: exercise question -> journey/profile field.
 * Add new mappings here as exercises are created.
 */
export const EXERCISE_FIELD_MAPPINGS: FieldMapping[] = [
  // Financial Readiness
  {
    exerciseSlug: "financial_readiness",
    questionKey: "pre_approval",
    targetTable: "user_journeys",
    targetField: "co_buyer_status",
    transform: (v) => {
      if (v === "approved") return "has_cobuyers";
      return undefined; // Don't set if not approved
    },
    overwriteExisting: false,
  },

  // Housing Preferences
  {
    exerciseSlug: "housing_preferences",
    questionKey: "target_metros",
    targetTable: "user_journeys",
    targetField: "target_markets",
    transform: (v) => (Array.isArray(v) && v.length > 0 ? v : undefined),
    overwriteExisting: false,
  },

  // Timeline & Commitment
  {
    exerciseSlug: "timeline_commitment",
    questionKey: "timeline",
    targetTable: "user_journeys",
    targetField: "target_timeline",
    overwriteExisting: false,
  },
  {
    exerciseSlug: "timeline_commitment",
    questionKey: "cobuyer_status",
    targetTable: "user_journeys",
    targetField: "co_buyer_status",
    transform: (v) => {
      if (v === "have_group" || v === "have_one") return "has_cobuyers";
      if (v === "seeking") return "seeking";
      if (v === "open") return "open";
      return undefined;
    },
    overwriteExisting: false,
  },

  // GEMs Discovery
  {
    exerciseSlug: "gems_discovery",
    questionKey: "timeline",
    targetTable: "user_journeys",
    targetField: "target_timeline",
    transform: (v) => {
      const map: Record<string, string> = {
        asap: "3mo",
        this_year: "12mo",
        "1_2_years": "18mo+",
        exploring: "exploring",
      };
      return map[v as string] ?? undefined;
    },
    overwriteExisting: false,
  },

  // Shared Home Vision
  {
    exerciseSlug: "shared_home_vision",
    questionKey: "timeline",
    targetTable: "user_journeys",
    targetField: "target_timeline",
    transform: (v) => {
      const map: Record<string, string> = {
        ready_now: "3mo",
        this_year: "12mo",
        "1_2_years": "18mo+",
        exploring: "exploring",
      };
      return map[v as string] ?? undefined;
    },
    overwriteExisting: false,
  },
  {
    exerciseSlug: "shared_home_vision",
    questionKey: "location_vibe",
    targetTable: "user_journeys",
    targetField: "target_markets",
    transform: (v) => (typeof v === "string" ? [v] : undefined),
    overwriteExisting: false,
  },

  // Co-Buyer Candidate Assessment
  {
    exerciseSlug: "cobuyer_candidate_assessment",
    questionKey: "candidate_name",
    targetTable: "user_journeys",
    targetField: "co_buyer_status",
    transform: (v) => {
      // If they've assessed someone, they have potential co-buyers
      return typeof v === "string" && v.length > 0 ? "has_cobuyers" : undefined;
    },
    overwriteExisting: false,
  },
];

/**
 * Propagate exercise answers to journey/profile fields.
 * Only sets null fields unless the mapping explicitly allows overwrite.
 *
 * Called as a fire-and-forget side-effect on exercise completion.
 */
export async function propagateExerciseToFields(
  userId: string,
  exerciseSlug: string,
  responses: Record<string, unknown>
): Promise<void> {
  const mappings = EXERCISE_FIELD_MAPPINGS.filter(
    (m) => m.exerciseSlug === exerciseSlug
  );

  if (mappings.length === 0) return;

  const serviceClient = createServiceRoleClient();

  // Collect updates per table
  const journeyUpdates: Record<string, unknown> = {};
  const profileUpdates: Record<string, unknown> = {};

  for (const mapping of mappings) {
    const rawValue = responses[mapping.questionKey];
    if (rawValue === undefined || rawValue === null) continue;

    const value = mapping.transform ? mapping.transform(rawValue) : rawValue;
    if (value === undefined) continue;

    if (mapping.targetTable === "user_journeys") {
      journeyUpdates[mapping.targetField] = value;
    } else {
      profileUpdates[mapping.targetField] = value;
    }
  }

  // Apply journey updates
  if (Object.keys(journeyUpdates).length > 0) {
    // Check existing values to respect overwriteExisting: false
    const { data: journey } = await serviceClient
      .from("user_journeys")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (journey) {
      const filteredUpdates: Record<string, unknown> = {};
      for (const [field, value] of Object.entries(journeyUpdates)) {
        const mapping = mappings.find(
          (m) => m.targetField === field && m.targetTable === "user_journeys"
        );
        const currentValue = journey[field];
        const isEmpty =
          currentValue === null ||
          currentValue === undefined ||
          currentValue === "" ||
          (Array.isArray(currentValue) && currentValue.length === 0) ||
          currentValue === "[]";

        if (mapping?.overwriteExisting || isEmpty) {
          filteredUpdates[field] = value;
        }
      }

      if (Object.keys(filteredUpdates).length > 0) {
        await serviceClient
          .from("user_journeys")
          .update({ ...filteredUpdates, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
    } else {
      // No journey exists — create one with exercise data
      await serviceClient.from("user_journeys").insert({
        user_id: userId,
        ...journeyUpdates,
      });
    }
  }

  // Apply profile updates
  if (Object.keys(profileUpdates).length > 0) {
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      const filteredUpdates: Record<string, unknown> = {};
      for (const [field, value] of Object.entries(profileUpdates)) {
        const mapping = mappings.find(
          (m) => m.targetField === field && m.targetTable === "profiles"
        );
        const currentValue = profile[field];

        if (
          mapping?.overwriteExisting ||
          currentValue === null ||
          currentValue === undefined
        ) {
          filteredUpdates[field] = value;
        }
      }

      if (Object.keys(filteredUpdates).length > 0) {
        await serviceClient
          .from("profiles")
          .update({
            ...filteredUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }
  }
}
