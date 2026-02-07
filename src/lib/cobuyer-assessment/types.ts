/**
 * Co-Buyer Compatibility Assessment Types
 */

export type AssessmentGrade = "A" | "B" | "C" | "D" | "F"

export interface DimensionScore {
  name: string
  weight: number
  score: number
  maxScore: number
  percentage: number
}

export interface AssessmentScoreResult {
  grade: AssessmentGrade
  totalPercentage: number
  dimensions: DimensionScore[]
  strengths: string[]
  concerns: string[]
  conversationsToHave: string[]
}

export interface CobuyerResponses {
  // Stage 1: Relationship Foundation
  candidate_name: string
  relationship_type: string
  relationship_duration: string
  lived_together: string
  roommate_context: string
  // Stage 2: Financial Compatibility
  financial_awareness: string
  shared_finances: string
  money_personality: string
  financial_transparency: string
  // Stage 3: Lifestyle
  lifestyle_dependents: string[]
  lifestyle_sensitivities: string
  work_situation: string
  lifestyle_alignment: string
  substance_concerns: string
  // Stage 4: Goals
  timeline_alignment: string
  ownership_duration: string
  property_vision: string
  buyout_expectation: string
  // Stage 5: Conflict
  conflict_style: string
  conflict_history: string
  agreement_willingness: string
  // Stage 6: Risk
  life_changes: string[]
  employment_stability: string
  pause_factors: string
  // Stage 7: Gut Check
  trust_score: number
  key_comfort: string
  exit_conversation: string
}
