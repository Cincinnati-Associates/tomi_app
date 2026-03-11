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
  // Stage 1: Who They Are
  candidate_name: string
  relationship_type: string
  relationship_duration: string
  // Stage 2: Money & Trust
  financial_awareness: string
  money_personality: string
  financial_transparency: string
  // Stage 3: Living Together
  lifestyle_dependents: string[]
  lifestyle_alignment: string
  work_situation: string
  // Stage 4: Goals & Plans
  timeline_alignment: string
  ownership_duration: string
  property_vision: string
  // Stage 5: Trust & Conflict
  conflict_style: string
  trust_score: number
  agreement_willingness: string
}
