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
        prompt: "If co-ownership could solve one thing for you, what would it be?",
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
        prompt: "What kind of timeline feels right for you?",
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
    ],
    transitionPrompt: (answers) => {
      const goalLabels: Record<string, string> = {
        build_wealth: "building wealth through real estate",
        afford_better: "getting a better home than they could alone",
        stop_renting: "moving on from renting",
        near_people: "living closer to family or friends",
        investment: "real estate investment",
        other: "their co-ownership goals",
      }
      const timelineLabels: Record<string, string> = {
        asap: "they want to move quickly (3-6 months)",
        this_year: "they're aiming for this year",
        "1_2_years": "they're thinking 1-2 years out",
        exploring: "they're in an exploration phase with no rush",
      }
      const goal = goalLabels[answers.primary_goal as string] || "co-ownership"
      const timeline = timelineLabels[answers.timeline as string] || "their own pace"
      const depth = answers.goal_depth as string | undefined

      let prompt = `[TRANSITION] The user's primary goal is ${goal}, and ${timeline}.`
      if (depth && depth !== "(skipped)") {
        prompt += ` They also shared this about why it matters to them: "${depth}".`
      }
      prompt += ` Generate a 2-3 sentence warm transition that: (1) reflects back the feeling behind their goal — not just the label, (2) includes one brief educational insight about why knowing your goals matters in co-ownership, and (3) naturally introduces the next section: "Now let's talk about what the experience itself would look like for you." Don't say "Great choice" or evaluate their answer.`
      return prompt
    },
  },
  {
    name: "Expectations",
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
    transitionPrompt: (answers) => {
      const durationLabels: Record<string, string> = {
        "2_3_years": "2-3 years",
        "3_5_years": "3-5 years",
        "5_10_years": "5-10 years",
        "10_plus": "10+ years",
        unsure: "not sure yet about duration",
      }
      const involvementLabels: Record<string, string> = {
        hands_on: "very hands-on",
        moderate: "splitting duties",
        minimal: "hiring help for management",
        unsure: "not sure yet about involvement",
      }
      const duration = durationLabels[answers.commitment_duration as string] || "their timeframe"
      const involvement = involvementLabels[answers.involvement_level as string] || "their involvement level"
      const vision = answers.success_vision as string | undefined
      const goal = answers.primary_goal as string

      let prompt = `[TRANSITION] The user is thinking about ${duration} of co-ownership, with a preference for ${involvement}. Their original goal was "${goal}".`
      if (vision && vision !== "(skipped)") {
        prompt += ` Their vision of success: "${vision}".`
      }
      prompt += ` Generate a 2-3 sentence warm transition that: (1) reflects what their expectations tell you about how they approach things, (2) references their original goal if it connects naturally, and (3) introduces the final section: "One more short section — this one's about what's driving you right now and any hesitations you might have. Being honest about both is really valuable." Don't evaluate or rank their answers.`
      return prompt
    },
  },
  {
    name: "Motivations",
    questions: [
      {
        key: "trigger",
        prompt: "What was the moment or situation that got you thinking about co-ownership?",
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
        prompt: "There's no wrong pace here. How does the timing feel for you right now?",
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
          "Everyone has questions or hesitations about co-ownership — that's completely normal and healthy. What's on your mind?",
        type: "text_with_skip",
        skipLabel: "Nothing right now",
      },
    ],
  },
]

export const GEMS_GREETING =
  "Hey there! I'm Homi — think of me as your co-ownership thinking partner."

export const GEMS_INTRO_PROMPT =
  "Generate an [INTRO] message for the GEMs discovery exercise. The user just arrived and saw your greeting. Now set the stage warmly in 3-5 sentences: explain that this is a short discovery conversation (not a quiz) that helps them get clear on their Goals, Expectations, and Motivations for co-ownership. Mention that most people haven't had a chance to think deeply about what they actually want from homeownership — and that's exactly what this is for. Emphasize there are no wrong answers and everything they share helps personalize their journey. Note it takes about 5 minutes across 3 short sections. Keep it conversational and grounded — like a thoughtful friend, not a corporate onboarding flow. No bullet points."
