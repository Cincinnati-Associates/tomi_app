/**
 * GEMs Exercise Label Maps
 *
 * Shared label mappings for rendering GEMs answers in human-readable form.
 * Used by both the GEMs summary card and the journey completion celebration.
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

  timelineLabels: {
    asap: "ASAP (3-6 months)",
    this_year: "This year",
    "1_2_years": "1-2 years",
    exploring: "Exploring for now",
  } as Record<string, string>,

  urgencyLabels: {
    very: "Very urgent",
    moderate: "Moderate",
    low: "Just exploring",
  } as Record<string, string>,
}
