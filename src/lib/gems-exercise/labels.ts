/**
 * GEMs Exercise Label Maps (v2)
 *
 * Shared label mappings for rendering GEMs answers in human-readable form.
 * Used by the GEMs summary card, journey completion celebration, and
 * the exercise context panel.
 */

export const GEMS_LABELS = {
  goalLabels: {
    build_wealth: "Build wealth",
    afford_better: "Afford a better home",
    stop_renting: "Stop renting",
    near_people: "Live near family/friends",
    investment: "Investment property",
    other: "Custom goal",
  } as Record<string, string>,

  commitmentLabels: {
    "2_3_years": "2-3 years",
    "3_5_years": "3-5 years",
    "5_10_years": "5-10 years",
    "10_plus": "10+ years",
    unsure: "Not sure yet",
  } as Record<string, string>,

  involvementLabels: {
    hands_on: "Very hands-on",
    moderate: "Split duties",
    minimal: "Hire it out",
    unsure: "Not sure",
  } as Record<string, string>,

  concernLabels: {
    disagreements: "Handling disagreements",
    nonpayment: "Someone not paying",
    exit: "Someone wanting out",
    financing: "Understanding financing",
    none: "None right now",
  } as Record<string, string>,
}

/**
 * Flat mapping of question key -> value -> display label.
 * Used by ExerciseContextPanel to render answers in the side panel.
 * Free-text keys (goal_depth, success_vision) are omitted —
 * the panel displays their raw text values directly.
 */
export const GEMS_ANSWER_LABELS: Record<string, Record<string, string>> = {
  primary_goal: GEMS_LABELS.goalLabels,
  commitment_duration: GEMS_LABELS.commitmentLabels,
  involvement_level: GEMS_LABELS.involvementLabels,
  concerns: GEMS_LABELS.concernLabels,
}

/**
 * Human-readable question names for the context panel.
 */
export const GEMS_QUESTION_NAMES: Record<string, string> = {
  primary_goal: "Goal",
  goal_depth: "Why it matters",
  concerns: "Top concern",
  commitment_duration: "Commitment",
  involvement_level: "Involvement",
  success_vision: "Vision of success",
}
