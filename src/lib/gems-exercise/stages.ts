/**
 * GEMs Exercise Stage Definitions (v2)
 *
 * 6 questions across 2 stages: Your Goal, Your Expectations.
 *
 * Questions that overlap with the co-buyer assessment use carry-forward:
 * - primary_goal: confirms/overrides assessment Q1 (motivation)
 * - concerns: confirms/overrides assessment Q6 (biggest concern)
 *
 * Dropped from v1 (redundant with assessment):
 * - timeline (exact dup of assessment Q12)
 * - trigger (overlaps assessment Q1 + Q3)
 * - urgency (triple-ask with timeline + trigger)
 */

import type { ExerciseStageDef } from "@/hooks/useConversationalExercise"

/**
 * Map assessment motivation answer index → GEMs primary_goal value.
 * Assessment Q1 options (index 0–3):
 *   0: "I've done the math — it's the fastest path to building equity" → build_wealth
 *   1: "I want to stop paying someone else's mortgage" → stop_renting
 *   2: "I like the idea of sharing the responsibility" → afford_better (closest match)
 *   3: "I'm not sure yet — just exploring" → other
 */
const ASSESSMENT_MOTIVATION_TO_GOAL: Record<number, { value: string; label: string }> = {
  0: { value: "build_wealth", label: "Build wealth" },
  1: { value: "stop_renting", label: "Stop renting" },
  2: { value: "afford_better", label: "Afford a better home" },
  3: { value: "other", label: "Just exploring" },
}

/**
 * Map assessment concern answer index → GEMs concern display label.
 * Assessment Q6 options (index 0–3):
 *   0: "How we'd handle disagreements on big decisions"
 *   1: "What happens if someone can't pay their share"
 *   2: "What happens if one of us wants out"
 *   3: "How does the financing work?"
 */
const ASSESSMENT_CONCERN_LABELS: Record<number, string> = {
  0: "Handling disagreements on big decisions",
  1: "Someone not being able to pay their share",
  2: "What happens if someone wants out",
  3: "Understanding how the financing works",
}

export const GEMS_STAGES: ExerciseStageDef[] = [
  {
    name: "Your Goal",
    homiPrompts: [
      "What are the real benefits of co-ownership?",
      "Is co-ownership right for me?",
      "How is co-buying different from renting together?",
    ],
    questions: [
      {
        key: "primary_goal",
        prompt: "If co-ownership could solve one thing for you, what would it be?",
        type: "confirm",
        confirmFallbackType: "chips",
        options: [
          { label: "Build wealth", value: "build_wealth" },
          { label: "Afford a better home", value: "afford_better" },
          { label: "Stop renting", value: "stop_renting" },
          { label: "Live near family/friends", value: "near_people" },
          { label: "Investment property", value: "investment" },
        ],
        carryForward: (prior) => {
          const answers = prior.assessmentAnswers as { optionIndex: number; isCustom?: boolean; customText?: string }[] | undefined
          if (!answers?.[0]) return null
          const a = answers[0]
          if (a.isCustom && a.customText) {
            return { label: a.customText, value: a.customText }
          }
          const mapped = ASSESSMENT_MOTIVATION_TO_GOAL[a.optionIndex]
          return mapped ?? null
        },
      },
      {
        key: "goal_depth",
        dynamicPrompt: (answers) => {
          const goalFollowUps: Record<string, string> = {
            build_wealth:
              "Building wealth through real estate is one of the most proven paths to financial security. What's driving that for you — long-term stability, wanting to stop feeling like rent is wasted money, or something else?",
            afford_better:
              "A lot of people discover they can get the home they actually want — not just what they can afford alone. What does 'a better home' look like for you?",
            stop_renting:
              "That feeling of paying someone else's mortgage every month is exhausting. What would it mean for you to finally have a place that's yours?",
            near_people:
              "Being close to the people who matter most can change everything about daily life. Who are you hoping to be closer to, and what would that look like?",
            investment:
              "Real estate has always been one of the best ways to build wealth, and co-ownership makes the entry point much more accessible. What got you thinking about property as an investment?",
            other:
              "I'd love to hear more about what's on your mind. What's drawing you to co-ownership?",
          }
          return (
            goalFollowUps[answers.primary_goal as string] ||
            "I'd love to hear more about what's on your mind. What's drawing you to co-ownership?"
          )
        },
        prompt: "I'd love to hear more about what's on your mind. What's drawing you to co-ownership?",
        type: "text_with_skip",
        skipLabel: "I'll share more later",
      },
      {
        key: "concerns",
        prompt: "Everyone has questions or hesitations about co-ownership — that's completely normal. What's on your mind?",
        type: "confirm",
        confirmFallbackType: "text_with_skip",
        skipLabel: "Nothing right now",
        options: [
          { label: "Handling disagreements on big decisions", value: "disagreements" },
          { label: "Someone not paying their share", value: "nonpayment" },
          { label: "What happens if someone wants out", value: "exit" },
          { label: "Understanding the financing", value: "financing" },
          { label: "Nothing right now", value: "none" },
        ],
        carryForward: (prior) => {
          const answers = prior.assessmentAnswers as { optionIndex: number; isCustom?: boolean; customText?: string }[] | undefined
          // Assessment Q6 is index 5 (0-based)
          if (!answers?.[5]) return null
          const a = answers[5]
          if (a.isCustom && a.customText) {
            return { label: a.customText, value: a.customText }
          }
          const label = ASSESSMENT_CONCERN_LABELS[a.optionIndex]
          if (!label) return null
          return { label, value: label }
        },
      },
    ],
  },
  {
    name: "Your Expectations",
    homiPrompts: [
      "How long do co-ownership agreements usually last?",
      "What does day-to-day co-ownership look like?",
      "Can I set my own level of involvement?",
    ],
    questions: [
      {
        key: "commitment_duration",
        prompt:
          "Co-ownership works best when everyone's on the same page about timing. How long could you see yourself in a co-owned home?",
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
          "Some co-owners love being hands-on with their home, others prefer to split duties or hire help. What sounds more like you?",
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
        prompt:
          "Imagine it's a few years from now and this co-ownership has worked out exactly how you hoped. What does that look like?",
        type: "text_with_skip",
        skipLabel: "I'll think about this later",
      },
    ],
  },
]

export const GEMS_GREETING =
  "Hey there! I'm Homi — think of me as your co-ownership thinking partner."

export const GEMS_INTRO_PROMPT =
  "Generate an [INTRO] message for the GEMs discovery exercise. The user just arrived and saw your greeting. Now set the stage warmly in 3-5 sentences: explain that this is a short discovery conversation (not a quiz) that helps them get clear on their Goals, Expectations, and Motivations for co-ownership. Mention that most people haven't had a chance to think deeply about what they actually want from homeownership — and that's exactly what this is for. Emphasize there are no wrong answers and everything they share helps personalize their journey. Note it takes about 5 minutes across 2 short sections. Keep it conversational and grounded — like a thoughtful friend, not a corporate onboarding flow. No bullet points."
