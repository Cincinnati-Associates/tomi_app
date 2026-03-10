/**
 * The Money Picture Exercise — 3 Stages, 8 Questions
 *
 * Captures financial inputs via chip-based ranges, then computes solo vs.
 * group buying power using range midpoints fed into calculateAffordability().
 */

import type { ExerciseStageDef } from "@/hooks/useConversationalExercise"

export const MONEY_PICTURE_STAGES: ExerciseStageDef[] = [
  // =========================================================================
  // STAGE 1: WHAT YOU EARN
  // =========================================================================
  {
    name: "What You Earn",
    questions: [
      {
        key: "income_range",
        prompt: "What's your approximate annual household income?",
        type: "chips",
        options: [
          { label: "Under $50k", value: "under_50k" },
          { label: "$50k\u2013$75k", value: "50k_75k" },
          { label: "$75k\u2013$100k", value: "75k_100k" },
          { label: "$100k\u2013$150k", value: "100k_150k" },
          { label: "$150k+", value: "150k_plus" },
        ],
      },
      {
        key: "savings_range",
        prompt: "How much do you have saved that could go toward a down payment?",
        type: "chips",
        options: [
          { label: "Under $10k", value: "under_10k" },
          { label: "$10k\u2013$25k", value: "10k_25k" },
          { label: "$25k\u2013$50k", value: "25k_50k" },
          { label: "$50k\u2013$100k", value: "50k_100k" },
          { label: "$100k+", value: "100k_plus" },
        ],
      },
      {
        key: "debt_range",
        prompt: "What are your total monthly debt payments?",
        type: "chips",
        options: [
          { label: "None or under $200", value: "under_200" },
          { label: "$200\u2013$500", value: "200_500" },
          { label: "$500\u2013$1,000", value: "500_1000" },
          { label: "$1,000\u2013$2,000", value: "1000_2000" },
          { label: "$2,000+", value: "2000_plus" },
        ],
      },
    ],
  },

  // =========================================================================
  // STAGE 2: YOUR COMFORT ZONE
  // =========================================================================
  {
    name: "Your Comfort Zone",
    questions: [
      {
        key: "monthly_comfort",
        prompt: "What monthly housing payment would you be comfortable with?",
        type: "chips",
        options: [
          { label: "Under $1,500", value: "under_1500" },
          { label: "$1,500\u2013$2,500", value: "1500_2500" },
          { label: "$2,500\u2013$3,500", value: "2500_3500" },
          { label: "$3,500\u2013$5,000", value: "3500_5000" },
          { label: "$5,000+", value: "5000_plus" },
        ],
      },
      {
        key: "cobuyer_count",
        prompt: "How many people total would co-own? (including you)",
        type: "number_scale",
        min: 2,
        max: 4,
      },
      {
        key: "credit_range",
        prompt: "What's your approximate credit score?",
        type: "chips",
        options: [
          { label: "Excellent (740+)", value: "excellent" },
          { label: "Good (670\u2013739)", value: "good" },
          { label: "Fair (580\u2013669)", value: "fair" },
          { label: "Not sure", value: "unsure" },
        ],
      },
    ],
  },

  // =========================================================================
  // STAGE 3: YOUR MARKET
  // =========================================================================
  {
    name: "Your Market",
    questions: [
      {
        key: "target_city",
        prompt: "Where are you looking to buy?",
        type: "chips",
        options: [
          { label: "San Francisco, CA", value: "san-francisco" },
          { label: "Los Angeles, CA", value: "los-angeles" },
          { label: "New York, NY", value: "new-york" },
          { label: "Seattle, WA", value: "seattle" },
          { label: "Denver, CO", value: "denver" },
          { label: "Austin, TX", value: "austin" },
          { label: "Miami, FL", value: "miami" },
          { label: "Chicago, IL", value: "chicago" },
          { label: "Phoenix, AZ", value: "phoenix" },
          { label: "Other / National Avg", value: "other" },
        ],
      },
      {
        key: "timeline",
        prompt: "When are you looking to buy?",
        type: "chips",
        options: [
          { label: "Ready now", value: "ready_now" },
          { label: "Within 6 months", value: "6_months" },
          { label: "6\u201312 months", value: "6_12_months" },
          { label: "1\u20132 years", value: "1_2_years" },
          { label: "Just exploring", value: "exploring" },
        ],
      },
    ],
  },
]

export const MONEY_PICTURE_SUBTEXT: Record<string, string> = {
  income_range:
    "This doesn't need to be exact — a rough range helps us estimate your buying power.",
  debt_range:
    "Include student loans, car payments, credit cards, and any other recurring monthly debts.",
  monthly_comfort:
    "Think about what you'd want to pay — not just what you could qualify for. Comfort matters.",
  credit_range:
    "Your credit score affects the interest rate you'll qualify for. If you're not sure, 'Not sure' is totally fine.",
  target_city:
    "We'll use local median home prices to show how your buying power stacks up in that market.",
}
