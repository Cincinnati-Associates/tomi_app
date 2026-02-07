/**
 * GEMs Exercise Stage Definitions
 *
 * 9 questions across 3 stages: Goals, Expectations, Motivations.
 */

import type { ExerciseStageDef } from "@/hooks/useConversationalExercise"

export const GEMS_STAGES: ExerciseStageDef[] = [
  {
    name: "Goals",
    questions: [
      {
        key: "primary_goal",
        prompt: "What's your #1 goal with co-ownership?",
        type: "chips",
        options: [
          { label: "Build wealth", value: "build_wealth" },
          { label: "Afford a better home", value: "afford_better" },
          { label: "Stop renting", value: "stop_renting" },
          { label: "Live near family/friends", value: "near_people" },
          { label: "Investment property", value: "investment" },
          { label: "Something else", value: "other" },
        ],
      },
      {
        key: "timeline",
        prompt: "When do you want this to happen?",
        type: "chips",
        options: [
          { label: "ASAP (3-6 months)", value: "asap" },
          { label: "This year", value: "this_year" },
          { label: "1-2 years", value: "1_2_years" },
          { label: "Exploring for now", value: "exploring" },
        ],
      },
      {
        key: "goal_depth",
        dynamicPrompt: (answers) => {
          const goalLabels: Record<string, string> = {
            build_wealth: "building wealth",
            afford_better: "affording a better home",
            stop_renting: "stopping renting",
            near_people: "living near family or friends",
            investment: "investing in property",
            other: "this",
          }
          const goal = goalLabels[answers.primary_goal as string] || "co-ownership"
          return `Tell me more about why ${goal} matters to you right now.`
        },
        prompt: "Tell me more about why this matters to you right now.",
        type: "text_with_skip",
        skipLabel: "I'd rather not say",
      },
    ],
    transitionPrompt: (answers) => {
      const goal = answers.primary_goal as string
      const timeline = answers.timeline as string
      return `The user's primary goal is "${goal}" with a timeline of "${timeline}". Generate a brief 1-2 sentence warm transition acknowledging their goal and moving to expectations. Be encouraging and natural.`
    },
  },
  {
    name: "Expectations",
    questions: [
      {
        key: "commitment_duration",
        prompt: "How long do you see yourself co-owning?",
        type: "chips",
        options: [
          { label: "2-3 years", value: "2_3_years" },
          { label: "3-5 years", value: "3_5_years" },
          { label: "5-10 years", value: "5_10_years" },
          { label: "10+ years", value: "10_plus" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
      {
        key: "involvement_level",
        prompt:
          "How involved do you want to be in managing the property?",
        type: "chips",
        options: [
          { label: "Very hands-on", value: "hands_on" },
          { label: "Moderate — split duties", value: "moderate" },
          { label: "Minimal — hire it out", value: "minimal" },
          { label: "Not sure", value: "unsure" },
        ],
      },
      {
        key: "success_vision",
        prompt: "What does success look like for you in 5 years?",
        type: "text_with_skip",
        skipLabel: "I'll think about this later",
      },
    ],
    transitionPrompt: () =>
      "The user has shared their co-ownership expectations. Generate a brief 1-2 sentence warm transition moving to motivations. Acknowledge what they shared and note that understanding their motivations will help personalize everything.",
  },
  {
    name: "Motivations",
    questions: [
      {
        key: "trigger",
        prompt: "What prompted you to explore co-ownership now?",
        type: "chips",
        options: [
          { label: "Priced out of market", value: "priced_out" },
          { label: "Friend/family suggested it", value: "suggestion" },
          { label: "Heard about TIC", value: "heard_tic" },
          { label: "Saw Tomi", value: "saw_tomi" },
          { label: "Tired of renting", value: "tired_renting" },
          { label: "Want to invest", value: "want_invest" },
        ],
      },
      {
        key: "urgency",
        prompt: "How urgent does this feel for you?",
        type: "chips",
        options: [
          { label: "Very — I need to act soon", value: "very" },
          { label: "Moderate — motivated but not rushed", value: "moderate" },
          { label: "Low — just exploring", value: "low" },
        ],
      },
      {
        key: "concerns",
        prompt:
          "What's your biggest concern or hesitation about co-ownership?",
        type: "text_with_skip",
        skipLabel: "Nothing comes to mind",
      },
    ],
  },
]

export const GEMS_GREETING =
  "Let's start by understanding what you want out of co-ownership — your Goals, Expectations, and Motivations. This takes about 5 minutes and makes everything that follows more personal."
