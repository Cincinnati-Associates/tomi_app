export interface HomeVisionVisualState {
  homeType: "house" | "condo" | "townhouse" | "vacation" | null
  location: "city" | "suburbs" | "mountains" | "beach" | null
  homeStyle: "modern" | "classic" | "rustic" | "undecided" | null
  coBuyerCount: number
  relationshipType: "friends" | "family" | "partners" | "mixed" | null
  usagePattern: "cohabitation" | "timeshare" | "mixed" | null
  budgetTier: 1 | 2 | 3 | 4 | 0
  timeline: "ready_now" | "this_year" | "1_2_years" | "exploring" | null
}

const BUDGET_TIER_MAP: Record<string, 1 | 2 | 3 | 4> = {
  tier1: 1,
  tier2: 2,
  tier3: 3,
  tier4: 4,
}

export function mapAnswersToVisual(
  answers: Record<string, unknown>
): HomeVisionVisualState {
  const budgetRaw = answers.budget_range as string | undefined
  const budgetTier =
    budgetRaw && budgetRaw !== "unsure" ? (BUDGET_TIER_MAP[budgetRaw] ?? 0) : 0

  return {
    homeType: (answers.home_type as HomeVisionVisualState["homeType"]) ?? null,
    location:
      (answers.location_vibe as HomeVisionVisualState["location"]) ?? null,
    homeStyle:
      (answers.home_style as HomeVisionVisualState["homeStyle"]) ?? null,
    coBuyerCount: (answers.cobuyer_count as number) ?? 0,
    relationshipType:
      (answers.relationship_type as HomeVisionVisualState["relationshipType"]) ??
      null,
    usagePattern:
      (answers.usage_pattern as HomeVisionVisualState["usagePattern"]) ?? null,
    budgetTier,
    timeline:
      (answers.timeline as HomeVisionVisualState["timeline"]) ?? null,
  }
}
