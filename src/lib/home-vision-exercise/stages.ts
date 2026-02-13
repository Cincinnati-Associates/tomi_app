import type { ExerciseStageDef } from "@/hooks/useConversationalExercise"

export const HOME_VISION_STAGES: ExerciseStageDef[] = [
  {
    name: "The Home",
    questions: [
      {
        key: "home_type",
        prompt: "What type of home are you envisioning?",
        type: "chips",
        options: [
          { label: "House", value: "house" },
          { label: "Condo / Apartment", value: "condo" },
          { label: "Townhouse", value: "townhouse" },
          { label: "Vacation Home", value: "vacation" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
      {
        key: "location_vibe",
        prompt: "Where do you see it?",
        type: "chips",
        options: [
          { label: "City / Urban", value: "city" },
          { label: "Suburbs", value: "suburbs" },
          { label: "Mountains / Rural", value: "mountains" },
          { label: "Beach / Coastal", value: "beach" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
      {
        key: "home_style",
        prompt: "What style speaks to you?",
        type: "chips",
        options: [
          { label: "Modern", value: "modern" },
          { label: "Classic / Traditional", value: "classic" },
          { label: "Cozy / Rustic", value: "rustic" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
    ],
  },
  {
    name: "The People",
    questions: [
      {
        key: "cobuyer_count",
        prompt: "How many co-owners total (including you)?",
        type: "number_scale",
        min: 2,
        max: 6,
      },
      {
        key: "relationship_type",
        prompt: "What's your relationship to your co-buyers?",
        type: "chips",
        options: [
          { label: "Friends", value: "friends" },
          { label: "Family", value: "family" },
          { label: "Partner(s)", value: "partners" },
          { label: "Mix of relationships", value: "mixed" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
      {
        key: "usage_pattern",
        prompt: "How will you share the property?",
        type: "chips",
        options: [
          { label: "Primary home \u2014 live together", value: "cohabitation" },
          { label: "Time-share \u2014 take turns", value: "timeshare" },
          { label: "Mix of both", value: "mixed" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
    ],
  },
  {
    name: "The Vision",
    questions: [
      {
        key: "budget_range",
        prompt: "What\u2019s your target budget for the property?",
        type: "chips",
        options: [
          { label: "Up to $500k", value: "tier1" },
          { label: "$500k \u2013 $1M", value: "tier2" },
          { label: "$1M \u2013 $2M", value: "tier3" },
          { label: "$2M+", value: "tier4" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
      {
        key: "timeline",
        prompt: "When are you looking to make this happen?",
        type: "chips",
        options: [
          { label: "Ready now", value: "ready_now" },
          { label: "This year", value: "this_year" },
          { label: "1\u20132 years", value: "1_2_years" },
          { label: "Just exploring", value: "exploring" },
        ],
      },
    ],
  },
]

/**
 * Educational subtext shown beneath certain questions.
 * Keyed by question key.
 */
export const QUESTION_SUBTEXT: Record<string, string> = {
  usage_pattern:
    'In co-ownership, "SACO" (Space-Allocated Co-Ownership) means everyone lives in the property together with dedicated spaces. "TACO" (Time-Allocated Co-Ownership) means co-owners take turns using the property on a shared schedule.',
  cobuyer_count:
    "Most co-ownership groups have 2\u20134 co-owners, but groups of up to 6 can work well with the right agreement in place.",
  budget_range:
    "This is the total property price \u2014 your share depends on how many co-owners split the cost.",
}
