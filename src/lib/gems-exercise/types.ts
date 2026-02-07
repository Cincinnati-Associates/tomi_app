/**
 * GEMs Exercise Types
 *
 * Goals, Expectations & Motivations discovery exercise.
 */

export interface GemsResponses {
  // Goals
  primary_goal: string
  timeline: string
  goal_depth: string
  // Expectations
  commitment_duration: string
  involvement_level: string
  success_vision: string
  // Motivations
  trigger: string
  urgency: string
  concerns: string
}

export interface GemsSummary {
  primaryGoal: string
  timeline: string
  urgency: string
  topConcern: string
}
