/**
 * Co-Buyer Compatibility Scoring Engine
 *
 * Dimension-weighted scoring across 7 assessment areas.
 */

import type { AssessmentGrade, AssessmentScoreResult, DimensionScore } from "./types"

// =============================================================================
// SCORE MAPS — option value → score
// =============================================================================

const SCORE_MAPS: Record<string, Record<string, number>> = {
  // Stage 1: Relationship Foundation
  relationship_type: { close_friend: 3, family: 2, romantic: 3, acquaintance: 0 },
  relationship_duration: { "10_plus": 3, "5_10": 2, "2_5": 1, under_2: 0 },
  lived_together: { yes_good: 3, yes_challenging: 1, no_extended: 2, no_never: 0 },
  // roommate_context: 0-1 (has answer = 1, skipped = 0)

  // Stage 2: Financial Compatibility
  financial_awareness: { open: 3, general: 2, not_discussed: 1, no_idea: 0 },
  shared_finances: { bills_rent: 3, smaller: 2, informal: 1, never: 0 },
  money_personality: { saver: 3, balanced: 2, spender: 1, unknown: 0 },
  financial_transparency: { definitely: 3, probably: 2, unsure: 1, probably_not: 0 },

  // Stage 3: Lifestyle
  lifestyle_sensitivities: { none: 3, minor: 2, significant: 1 },
  work_situation: { remote: 2, in_office: 2, travels: 1, irregular: 1, unsure: 0 },
  lifestyle_alignment: { very: 3, mostly: 2, different: 0, unknown: 0 },
  substance_concerns: { none: 3, minor: 2, needs_conversation: 1, uncomfortable: 0 },

  // Stage 4: Goals & Expectations
  timeline_alignment: { same_page: 3, close: 2, different: 0, not_discussed: 0 },
  ownership_duration: { "5_plus": 3, "3_5": 2, "1_3": 1, unsure: 0 },
  property_vision: { live_in: 3, investment: 3, overlapping: 1, not_discussed: 0 },
  buyout_expectation: { yes_plan: 2, possible: 2, sell_together: 2, not_thought: 0 },

  // Stage 5: Conflict & Communication
  conflict_style: { direct: 3, takes_time: 2, avoids: 0, reactive: 0 },
  // conflict_history: 0-2 (text-based)
  agreement_willingness: { absolutely: 3, open: 2, maybe: 1, probably_not: 0 },

  // Stage 6: Risk
  employment_stability: { very_stable: 3, stable: 2, uncertain: 1, unknown: 0 },
  // life_changes, pause_factors: scored differently

  // Stage 7: Gut Check
  key_comfort: { completely: 3, mostly: 2, nervous: 1, no: 0 },
  exit_conversation: { definitely: 3, probably: 2, unsure: 1, worried: 0 },
}

// =============================================================================
// DIMENSION DEFINITIONS
// =============================================================================

interface DimensionDef {
  name: string
  weight: number
  questionKeys: string[]
  maxPoints: number
}

const DIMENSIONS: DimensionDef[] = [
  {
    name: "Relationship Foundation",
    weight: 0.15,
    questionKeys: ["relationship_type", "relationship_duration", "lived_together", "roommate_context"],
    maxPoints: 10,
  },
  {
    name: "Financial Compatibility",
    weight: 0.25,
    questionKeys: ["financial_awareness", "shared_finances", "money_personality", "financial_transparency"],
    maxPoints: 12,
  },
  {
    name: "Lifestyle Alignment",
    weight: 0.15,
    questionKeys: ["lifestyle_dependents", "lifestyle_sensitivities", "work_situation", "lifestyle_alignment", "substance_concerns"],
    maxPoints: 13,
  },
  {
    name: "Goals & Expectations",
    weight: 0.20,
    questionKeys: ["timeline_alignment", "ownership_duration", "property_vision", "buyout_expectation"],
    maxPoints: 11,
  },
  {
    name: "Conflict & Communication",
    weight: 0.15,
    questionKeys: ["conflict_style", "conflict_history", "agreement_willingness"],
    maxPoints: 8,
  },
  {
    name: "Risk & Stability",
    weight: 0.05,
    questionKeys: ["life_changes", "employment_stability", "pause_factors"],
    maxPoints: 9,
  },
  {
    name: "Gut Check",
    weight: 0.05,
    questionKeys: ["trust_score", "key_comfort", "exit_conversation"],
    maxPoints: 9,
  },
]

// =============================================================================
// SCORING
// =============================================================================

function scoreQuestion(key: string, value: unknown): number {
  if (value === undefined || value === null) return 0

  // Special cases
  if (key === "roommate_context" || key === "conflict_history" || key === "pause_factors") {
    // Text fields: answered = 1, skipped = 0
    return typeof value === "string" && value.length > 0 && value !== "(skipped)" ? 1 : 0
  }

  if (key === "trust_score") {
    // Normalize 1-10 to 0-3
    const num = typeof value === "number" ? value : 0
    if (num >= 8) return 3
    if (num >= 6) return 2
    if (num >= 4) return 1
    return 0
  }

  if (key === "lifestyle_dependents" || key === "life_changes") {
    // Multi-select: any answer = 2
    return 2
  }

  // Standard chip scoring
  const map = SCORE_MAPS[key]
  if (!map) return 0

  return map[value as string] ?? 0
}

function getGrade(percentage: number): AssessmentGrade {
  if (percentage >= 85) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 50) return "C"
  if (percentage >= 30) return "D"
  return "F"
}

function identifyStrengths(dimensions: DimensionScore[]): string[] {
  return dimensions
    .filter((d) => d.percentage >= 75)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3)
    .map((d) => d.name)
}

function identifyConcerns(dimensions: DimensionScore[]): string[] {
  return dimensions
    .filter((d) => d.percentage < 50)
    .sort((a, b) => a.percentage - b.percentage)
    .map((d) => d.name)
}

function suggestConversations(
  answers: Record<string, unknown>,
  dimensions: DimensionScore[]
): string[] {
  const suggestions: string[] = []
  const name = (answers.candidate_name as string) || "them"

  // Financial transparency concern
  if (answers.financial_transparency === "unsure" || answers.financial_transparency === "probably_not") {
    suggestions.push(
      `Have an open conversation with ${name} about financial transparency — income, debts, and credit scores. Frame it as a requirement of the process, not a trust issue.`
    )
  }

  // Timeline misalignment
  if (answers.timeline_alignment === "different" || answers.timeline_alignment === "not_discussed") {
    suggestions.push(
      `Discuss specific timelines with ${name}. You may be months or years apart on when you want to buy.`
    )
  }

  // Conflict avoidance
  if (answers.conflict_style === "avoids" || answers.conflict_style === "reactive") {
    suggestions.push(
      `Talk about how you'll handle disagreements. Consider establishing ground rules for difficult conversations early.`
    )
  }

  // Agreement willingness
  if (answers.agreement_willingness === "maybe" || answers.agreement_willingness === "probably_not") {
    suggestions.push(
      `Introduce the concept of a co-ownership agreement as protection for both of you, not as a sign of distrust.`
    )
  }

  // Low financial dimension
  const financialDim = dimensions.find((d) => d.name === "Financial Compatibility")
  if (financialDim && financialDim.percentage < 50) {
    suggestions.push(
      `You and ${name} should have a deeper conversation about money — shared expenses, saving habits, and financial goals.`
    )
  }

  // Exit concern
  if (answers.exit_conversation === "unsure" || answers.exit_conversation === "worried") {
    suggestions.push(
      `Discuss exit scenarios openly. What happens if one person wants out? A written agreement handles this, but the conversation matters too.`
    )
  }

  return suggestions.slice(0, 4)
}

/**
 * Score a completed co-buyer compatibility assessment.
 */
export function scoreCobuyerAssessment(
  answers: Record<string, unknown>
): AssessmentScoreResult {
  const dimensions: DimensionScore[] = DIMENSIONS.map((dim) => {
    let totalScore = 0
    for (const key of dim.questionKeys) {
      totalScore += scoreQuestion(key, answers[key])
    }

    const percentage =
      dim.maxPoints > 0 ? Math.round((totalScore / dim.maxPoints) * 100) : 0

    return {
      name: dim.name,
      weight: dim.weight,
      score: totalScore,
      maxScore: dim.maxPoints,
      percentage,
    }
  })

  // Weighted total
  const weightedTotal = dimensions.reduce(
    (sum, d) => sum + d.percentage * d.weight,
    0
  )
  const totalPercentage = Math.round(weightedTotal)

  return {
    grade: getGrade(totalPercentage),
    totalPercentage,
    dimensions,
    strengths: identifyStrengths(dimensions),
    concerns: identifyConcerns(dimensions),
    conversationsToHave: suggestConversations(answers, dimensions),
  }
}
