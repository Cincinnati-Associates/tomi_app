/**
 * Risk & Exit Preferences Exercise — 2 Stages, 8 Questions
 *
 * A form-style exercise where users define their risk tolerance
 * and exit scenario preferences. Options include descriptions to
 * educate while capturing preferences.
 *
 * Feeds into: Agreement Framework (M5), compatibility scoring (M4).
 */

import type { ExerciseStageDef } from "@/hooks/useConversationalExercise"

export const RISK_EXIT_STAGES: ExerciseStageDef[] = [
  // =========================================================================
  // STAGE 1: YOUR RISK COMFORT
  // =========================================================================
  {
    name: "Risk Comfort",
    homiPrompts: [
      "These questions might feel heavy, but thinking about risk now prevents surprises later.",
      "There are no wrong answers here — it's about knowing your own comfort level.",
      "What does risk mean in co-ownership?",
    ],
    questions: [
      {
        key: "risk_tolerance",
        prompt: "How would you describe your overall risk tolerance for co-ownership?",
        type: "chips",
        options: [
          {
            label: "Conservative",
            value: "conservative",
            description: "I want maximum protection. Clear rules, minimal surprises.",
          },
          {
            label: "Moderate",
            value: "moderate",
            description: "I'm comfortable with some flexibility if the structure is sound.",
          },
          {
            label: "Flexible",
            value: "flexible",
            description: "I'm adaptable. I trust good communication over rigid rules.",
          },
        ],
      },
      {
        key: "biggest_financial_worry",
        prompt: "What's your biggest financial worry about co-owning?",
        type: "chips",
        options: [
          { label: "Someone can't pay their share", value: "cant_pay" },
          { label: "Property loses value", value: "loses_value" },
          { label: "Unexpected major repairs", value: "major_repairs" },
          { label: "Legal disputes", value: "legal_disputes" },
          { label: "Being locked in too long", value: "locked_in" },
        ],
      },
      {
        key: "job_loss_scenario",
        prompt: "If a co-owner lost their job, what should happen?",
        type: "chips",
        options: [
          {
            label: "Grace period",
            value: "grace_period",
            description: "Give them 3-6 months to recover before any action",
          },
          {
            label: "Immediate restructure",
            value: "immediate_restructure",
            description: "Adjust contributions right away to share the burden",
          },
          {
            label: "Trigger buyout discussion",
            value: "trigger_buyout",
            description: "Start discussing a buyout or replacement",
          },
        ],
      },
      {
        key: "early_sell_scenario",
        prompt: "If a co-owner wants to sell their share early, what should happen?",
        type: "chips",
        options: [
          {
            label: "Right of first refusal",
            value: "right_of_first_refusal",
            description: "Other co-owners get first chance to buy their share",
          },
          {
            label: "Open market",
            value: "open_market",
            description: "They can sell their share to anyone who qualifies",
          },
          {
            label: "Mandatory buyout",
            value: "mandatory_buyout",
            description: "Co-owners must buy them out at appraised value",
          },
        ],
      },
      {
        key: "dispute_resolution",
        prompt: "How would you prefer to resolve disputes?",
        type: "chips",
        options: [
          { label: "Mediation first", value: "mediation" },
          { label: "Binding arbitration", value: "arbitration" },
          { label: "Legal action as last resort", value: "legal" },
        ],
      },
    ],
  },

  // =========================================================================
  // STAGE 2: YOUR EXIT PLAN
  // =========================================================================
  {
    name: "Exit Plan",
    homiPrompts: [
      "Groups that discuss exit terms before buying have significantly fewer disputes.",
      "What is a right of first refusal?",
      "How are buyout prices determined?",
    ],
    questions: [
      {
        key: "minimum_hold_period",
        prompt: "What's the minimum time you'd want to hold the property before anyone can sell?",
        type: "chips",
        options: [
          { label: "No minimum", value: "no_minimum" },
          { label: "2 years", value: "2_years" },
          { label: "3 years", value: "3_years" },
          { label: "5 years", value: "5_years" },
          { label: "Until we all agree", value: "unanimous" },
        ],
      },
      {
        key: "buyout_calculation",
        prompt: "How should a buyout price be calculated?",
        type: "chips",
        options: [
          {
            label: "Appraised value",
            value: "appraised",
            description: "Based on current market appraisal (fairest but costs money)",
          },
          {
            label: "Formula-based",
            value: "formula",
            description: "Original investment + share of appreciation (predictable)",
          },
          {
            label: "Negotiated",
            value: "negotiated",
            description: "Agree on a price when the time comes (flexible but risky)",
          },
        ],
      },
      {
        key: "exit_dealbreakers",
        prompt: "Which situations should trigger an immediate exit discussion?",
        type: "multi_chips",
        options: [
          { label: "Criminal activity", value: "criminal_activity" },
          { label: "Repeated non-payment (3+ months)", value: "non_payment" },
          { label: "Unauthorized property modifications", value: "unauthorized_mods" },
          { label: "Subletting without consent", value: "subletting" },
          { label: "Bankruptcy filing", value: "bankruptcy" },
          { label: "None — I'd work through anything", value: "none" },
        ],
      },
    ],
  },
]

export const RISK_EXIT_GREETING =
  "Let's figure out your risk comfort and exit preferences. These answers will shape the legal protections in your co-ownership agreement."
