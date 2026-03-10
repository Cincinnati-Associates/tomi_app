/**
 * Risk & Exit Preferences Exercise — 2 Stages, 8 Questions
 *
 * Captures individual preferences for risk tolerance, dispute resolution,
 * exit strategies, and buyout mechanics. No scoring — these are preferences
 * that feed into the Agreement Framework.
 */

import type { ExerciseStageDef } from "@/hooks/useConversationalExercise"

export const RISK_EXIT_STAGES: ExerciseStageDef[] = [
  // =========================================================================
  // STAGE 1: YOUR RISK COMFORT
  // =========================================================================
  {
    name: "Risk Comfort",
    homiPrompts: [
      "What are the biggest risks of co-ownership?",
      "How do TIC agreements protect me?",
      "What if someone can't pay?",
    ],
    questions: [
      {
        key: "risk_tolerance",
        prompt: "How would you describe your comfort with financial risk?",
        type: "chips",
        options: [
          { label: "Conservative — maximum protection and predictability", value: "conservative" },
          { label: "Moderate — some uncertainty is fine if the upside is worth it", value: "moderate" },
          { label: "Flexible — willing to take on more risk for potential reward", value: "flexible" },
        ],
      },
      {
        key: "financial_worry",
        prompt: "What's your biggest financial concern about co-owning?",
        type: "chips",
        options: [
          { label: "A co-owner can't make their payments", value: "missed_payments" },
          { label: "Property loses value", value: "value_loss" },
          { label: "Unexpected major repairs", value: "repairs" },
          { label: "Getting locked in longer than I want", value: "locked_in" },
          { label: "I'm not particularly worried", value: "not_worried" },
        ],
      },
      {
        key: "job_loss_response",
        prompt: "If a co-owner lost their job, what should happen?",
        type: "chips",
        options: [
          { label: "Grace period (3-6 months) to get back on track", value: "grace_period" },
          { label: "The group covers their share temporarily", value: "group_covers" },
          { label: "They need to find their own solution quickly", value: "own_solution" },
          { label: "It depends on the circumstances", value: "depends" },
        ],
      },
      {
        key: "early_exit_response",
        prompt: "If a co-owner wants to sell their share early, what feels right?",
        type: "chips",
        options: [
          { label: "Other owners get first right to buy them out", value: "first_refusal" },
          { label: "They can sell to anyone, with group approval", value: "sell_with_approval" },
          { label: "They should be able to sell freely", value: "sell_freely" },
          { label: "There should be a minimum hold period first", value: "min_hold" },
        ],
      },
      {
        key: "dispute_resolution",
        prompt: "If co-owners disagree on something major, how should it be resolved?",
        type: "chips",
        options: [
          { label: "Professional mediation first", value: "mediation" },
          { label: "Binding arbitration", value: "arbitration" },
          { label: "Majority vote among owners", value: "majority_vote" },
          { label: "Whatever's in the written agreement", value: "per_agreement" },
        ],
      },
    ],
    transitionPrompt: () =>
      "Generate a 1-2 sentence transition from risk comfort to exit planning. Acknowledge that thinking through worst-case scenarios upfront is what separates successful co-ownership from messy ones. Move to specifics about exit mechanics.",
  },

  // =========================================================================
  // STAGE 2: YOUR EXIT PLAN
  // =========================================================================
  {
    name: "Exit Plan",
    homiPrompts: [
      "How do exit clauses work?",
      "What is right of first refusal?",
      "How are buyout prices calculated?",
    ],
    questions: [
      {
        key: "min_hold_period",
        prompt: "What's the minimum time you'd want everyone committed to co-owning?",
        type: "chips",
        options: [
          { label: "At least 5 years", value: "5_plus" },
          { label: "3-5 years", value: "3_5" },
          { label: "1-3 years", value: "1_3" },
          { label: "No minimum — flexibility is more important", value: "no_minimum" },
        ],
      },
      {
        key: "buyout_method",
        prompt: "If someone is bought out, how should the price be determined?",
        type: "chips",
        options: [
          { label: "Independent appraisal at current market value", value: "appraisal" },
          { label: "Original investment plus share of appreciation", value: "investment_plus" },
          { label: "Negotiated between the parties", value: "negotiated" },
          { label: "Formula agreed on upfront in the contract", value: "formula" },
        ],
      },
      {
        key: "deal_breakers",
        prompt: "Which situations would make you want to exit immediately?",
        type: "multi_chips",
        options: [
          { label: "Co-owner stops paying their share", value: "non_payment" },
          { label: "Major undisclosed debt or legal issues", value: "undisclosed_issues" },
          { label: "Moving someone in without agreement", value: "unauthorized_occupant" },
          { label: "Property damage from neglect", value: "property_damage" },
          { label: "Fundamental disagreement on property use", value: "use_disagreement" },
          { label: "None — I'd try to work through anything", value: "none" },
        ],
      },
    ],
  },
]

export const RISK_EXIT_GREETING =
  "Let's figure out your risk comfort level and exit preferences. These answers shape your co-ownership agreement — there are no wrong answers, just what feels right for you."
