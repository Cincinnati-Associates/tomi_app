/**
 * Co-Buyer Compatibility Assessment — 7 Stages, 23 Questions
 */

import type { ExerciseStageDef } from "@/hooks/useConversationalExercise"

export const COBUYER_STAGES: ExerciseStageDef[] = [
  // =========================================================================
  // STAGE 1: RELATIONSHIP FOUNDATION
  // =========================================================================
  {
    name: "Relationship",
    questions: [
      {
        key: "candidate_name",
        prompt: "First, who are you thinking about? What's their first name?",
        type: "text",
      },
      {
        key: "relationship_type",
        dynamicPrompt: (a) =>
          `How would you describe your relationship with ${a.candidate_name || "them"}?`,
        prompt: "How would you describe your relationship with them?",
        type: "chips",
        options: [
          { label: "Close friend", value: "close_friend" },
          { label: "Family member", value: "family" },
          { label: "Romantic partner", value: "romantic" },
          { label: "Acquaintance/colleague", value: "acquaintance" },
        ],
      },
      {
        key: "relationship_duration",
        dynamicPrompt: (a) =>
          `How long have you known ${a.candidate_name || "them"}?`,
        prompt: "How long have you known them?",
        type: "chips",
        options: [
          { label: "10+ years", value: "10_plus" },
          { label: "5-10 years", value: "5_10" },
          { label: "2-5 years", value: "2_5" },
          { label: "Less than 2 years", value: "under_2" },
        ],
      },
      {
        key: "lived_together",
        dynamicPrompt: (a) =>
          `Have you ever lived with ${a.candidate_name || "them"} or been roommates?`,
        prompt: "Have you ever lived with them or been roommates?",
        type: "chips",
        options: [
          { label: "Yes — it went well", value: "yes_good" },
          { label: "Yes — it was challenging", value: "yes_challenging" },
          { label: "No — but I've spent extended time with them", value: "no_extended" },
          { label: "No — never", value: "no_never" },
        ],
      },
      {
        key: "roommate_context",
        dynamicPrompt: (a) =>
          a.lived_together === "yes_good" || a.lived_together === "yes_challenging"
            ? "What was that like?"
            : `What would previous roommates say about ${a.candidate_name || "them"}?`,
        prompt: "What was that like living together?",
        type: "text_with_skip",
        skipLabel: "I'd rather not say",
      },
    ],
    transitionPrompt: (a) =>
      `The user is assessing "${a.candidate_name}" as a potential co-buyer. They describe the relationship as "${a.relationship_type}", known for "${a.relationship_duration}", living together: "${a.lived_together}". Generate a 1-2 sentence transition acknowledging the relationship foundation and moving to financial compatibility. Be warm and natural.`,
  },

  // =========================================================================
  // STAGE 2: FINANCIAL COMPATIBILITY
  // =========================================================================
  {
    name: "Financial",
    questions: [
      {
        key: "financial_awareness",
        dynamicPrompt: (a) =>
          `Do you have a rough idea of ${a.candidate_name || "their"}'s financial situation?`,
        prompt: "Do you have a rough idea of their financial situation?",
        type: "chips",
        options: [
          { label: "Yes — we're pretty open", value: "open" },
          { label: "General sense", value: "general" },
          { label: "Haven't discussed it", value: "not_discussed" },
          { label: "No idea", value: "no_idea" },
        ],
      },
      {
        key: "shared_finances",
        dynamicPrompt: (a) =>
          `Have you ever shared financial responsibilities with ${a.candidate_name || "them"}?`,
        prompt: "Have you ever shared financial responsibilities with them?",
        type: "chips",
        options: [
          { label: "Split bills/rent", value: "bills_rent" },
          { label: "Smaller things (trips, events)", value: "smaller" },
          { label: "Only informal (splitting dinner)", value: "informal" },
          { label: "Never", value: "never" },
        ],
      },
      {
        key: "money_personality",
        dynamicPrompt: (a) =>
          `How would you describe ${a.candidate_name || "their"}'s relationship with money?`,
        prompt: "How would you describe their relationship with money?",
        type: "chips",
        options: [
          { label: "Saver/planner", value: "saver" },
          { label: "Balanced", value: "balanced" },
          { label: "Spender — lives in the moment", value: "spender" },
          { label: "I honestly don't know", value: "unknown" },
        ],
      },
      {
        key: "financial_transparency",
        dynamicPrompt: (a) =>
          `Would ${a.candidate_name || "they"} be comfortable being fully transparent about finances — income, debts, credit?`,
        prompt: "Would they be comfortable being fully transparent about finances?",
        type: "chips",
        options: [
          { label: "Definitely — they're an open book", value: "definitely" },
          { label: "Probably — with the right framework", value: "probably" },
          { label: "I'm not sure", value: "unsure" },
          { label: "Probably not", value: "probably_not" },
        ],
      },
    ],
    transitionPrompt: (a) =>
      `Financial awareness: "${a.financial_awareness}", shared finances: "${a.shared_finances}", money personality: "${a.money_personality}". Generate a 1-2 sentence transition from financial compatibility to lifestyle alignment. Briefly note the importance of financial alignment and move to day-to-day compatibility. Be warm.`,
  },

  // =========================================================================
  // STAGE 3: LIFESTYLE & LIVING ALIGNMENT
  // =========================================================================
  {
    name: "Lifestyle",
    questions: [
      {
        key: "lifestyle_dependents",
        dynamicPrompt: (a) =>
          `Does ${a.candidate_name || "they"} have pets, kids, or plan to in the near future?`,
        prompt: "Do they have pets, kids, or plan to in the near future?",
        type: "multi_chips",
        options: [
          { label: "Has pets", value: "has_pets" },
          { label: "Has kids", value: "has_kids" },
          { label: "Plans to have kids", value: "plans_kids" },
          { label: "Plans to get pets", value: "plans_pets" },
          { label: "None of the above", value: "none" },
        ],
      },
      {
        key: "lifestyle_sensitivities",
        prompt: "Any dietary restrictions, allergies, or sensitivities that would affect shared spaces?",
        type: "chips",
        options: [
          { label: "None that I know of", value: "none" },
          { label: "Yes — minor things", value: "minor" },
          { label: "Yes — significant considerations", value: "significant" },
        ],
      },
      {
        key: "work_situation",
        dynamicPrompt: (a) =>
          `What's ${a.candidate_name || "their"}'s work situation?`,
        prompt: "What's their work situation?",
        type: "chips",
        options: [
          { label: "Remote/hybrid", value: "remote" },
          { label: "In-office — regular schedule", value: "in_office" },
          { label: "Travels frequently", value: "travels" },
          { label: "Irregular/flexible", value: "irregular" },
          { label: "Not sure", value: "unsure" },
        ],
      },
      {
        key: "lifestyle_alignment",
        prompt: "How aligned are you on habits — cleanliness, noise, having guests over?",
        type: "chips",
        options: [
          { label: "Very aligned with mine", value: "very" },
          { label: "Mostly aligned — minor differences", value: "mostly" },
          { label: "We're pretty different", value: "different" },
          { label: "I don't really know", value: "unknown" },
        ],
      },
      {
        key: "substance_concerns",
        prompt: "Anything regarding smoking, drinking, or substances you'd want to address?",
        type: "chips",
        options: [
          { label: "No concerns", value: "none" },
          { label: "Minor — nothing that'd be an issue", value: "minor" },
          { label: "Yes — this would need a conversation", value: "needs_conversation" },
          { label: "I'm not comfortable discussing this", value: "uncomfortable" },
        ],
      },
    ],
    transitionPrompt: () =>
      "Generate a 1-2 sentence transition from lifestyle to goals & expectations. Note that lifestyle differences are usually manageable when discussed upfront. Move to the bigger picture — goals for the property.",
  },

  // =========================================================================
  // STAGE 4: GOALS & EXPECTATIONS
  // =========================================================================
  {
    name: "Goals",
    questions: [
      {
        key: "timeline_alignment",
        dynamicPrompt: (a) =>
          `Do you think ${a.candidate_name || "they"} shares your timeline for buying?`,
        prompt: "Do you think they share your timeline for buying?",
        type: "chips",
        options: [
          { label: "Yes — same page", value: "same_page" },
          { label: "Close but might need to align", value: "close" },
          { label: "Probably different timelines", value: "different" },
          { label: "Haven't discussed timing", value: "not_discussed" },
        ],
      },
      {
        key: "ownership_duration",
        dynamicPrompt: (a) =>
          `How long do you think ${a.candidate_name || "they"} would want to co-own the property?`,
        prompt: "How long do you think they would want to co-own the property?",
        type: "chips",
        options: [
          { label: "5+ years", value: "5_plus" },
          { label: "3-5 years", value: "3_5" },
          { label: "1-3 years", value: "1_3" },
          { label: "Not sure — haven't talked about it", value: "unsure" },
        ],
      },
      {
        key: "property_vision",
        prompt: "Same vision for the property — live in it, invest, vacation home?",
        type: "chips",
        options: [
          { label: "Yes — both want to live in it", value: "live_in" },
          { label: "Yes — both see it as investment", value: "investment" },
          { label: "Kind of — overlapping but different priorities", value: "overlapping" },
          { label: "Haven't discussed this", value: "not_discussed" },
        ],
      },
      {
        key: "buyout_expectation",
        prompt: "Would either of you eventually want to buy the other out?",
        type: "chips",
        options: [
          { label: "Yes that's the plan", value: "yes_plan" },
          { label: "It's a possibility", value: "possible" },
          { label: "No — we'd sell together", value: "sell_together" },
          { label: "Haven't thought about it", value: "not_thought" },
        ],
      },
    ],
    transitionPrompt: () =>
      "Generate a 1-2 sentence transition from goals to conflict & communication. Note that goal alignment is critical and that Tomi agreements cover this explicitly. Move to handling disagreements.",
  },

  // =========================================================================
  // STAGE 5: CONFLICT & COMMUNICATION
  // =========================================================================
  {
    name: "Conflict",
    questions: [
      {
        key: "conflict_style",
        dynamicPrompt: (a) =>
          `How does ${a.candidate_name || "they"} typically handle disagreements?`,
        prompt: "How do they typically handle disagreements?",
        type: "chips",
        options: [
          { label: "Directly and constructively", value: "direct" },
          { label: "Takes time to cool down — then addresses it", value: "takes_time" },
          { label: "Tends to avoid conflict", value: "avoids" },
          { label: "Can be reactive or defensive", value: "reactive" },
        ],
      },
      {
        key: "conflict_history",
        dynamicPrompt: (a) =>
          `Have you ever had a significant conflict with ${a.candidate_name || "them"}?`,
        prompt: "Have you ever had a significant conflict with them?",
        type: "text_with_skip",
        skipLabel: "No major conflicts",
      },
      {
        key: "agreement_willingness",
        dynamicPrompt: (a) =>
          `Would ${a.candidate_name || "they"} be willing to put everything in a written legal agreement?`,
        prompt: "Would they be willing to put everything in a written legal agreement?",
        type: "chips",
        options: [
          { label: "Absolutely — they'd probably insist", value: "absolutely" },
          { label: "Yes — I think they'd be open to it", value: "open" },
          { label: "Maybe — I'd need to convince them", value: "maybe" },
          { label: "Probably not — they might see it as distrust", value: "probably_not" },
        ],
      },
    ],
    transitionPrompt: () =>
      "Generate a 1-2 sentence transition from conflict to life changes & risk factors. Note that handling disagreements early sets the tone. Move to 'what ifs.'",
  },

  // =========================================================================
  // STAGE 6: LIFE CHANGES & RISK
  // =========================================================================
  {
    name: "Risk",
    questions: [
      {
        key: "life_changes",
        dynamicPrompt: (a) =>
          `Any major life changes on ${a.candidate_name || "their"}'s horizon?`,
        prompt: "Any major life changes on their horizon?",
        type: "multi_chips",
        options: [
          { label: "Marriage/engagement", value: "marriage" },
          { label: "Having children", value: "children" },
          { label: "Career change/relocation", value: "career_change" },
          { label: "Divorce/separation", value: "divorce" },
          { label: "None that I know of", value: "none" },
          { label: "I'm not sure", value: "unsure" },
        ],
      },
      {
        key: "employment_stability",
        dynamicPrompt: (a) =>
          `How stable is ${a.candidate_name || "their"}'s employment?`,
        prompt: "How stable is their employment?",
        type: "chips",
        options: [
          { label: "Very stable — long-term", value: "very_stable" },
          { label: "Stable — no red flags", value: "stable" },
          { label: "Somewhat uncertain", value: "uncertain" },
          { label: "I don't know enough to say", value: "unknown" },
        ],
      },
      {
        key: "pause_factors",
        dynamicPrompt: (a) =>
          `Is there anything about ${a.candidate_name || "them"} that gives you pause — even something small?`,
        prompt: "Is there anything about them that gives you pause — even something small?",
        type: "text_with_skip",
        skipLabel: "Nothing comes to mind",
      },
    ],
    transitionPrompt: () =>
      "Generate a 1-2 sentence transition to the final gut check section. Acknowledge they've been thorough and this is the last section.",
  },

  // =========================================================================
  // STAGE 7: THE GUT CHECK
  // =========================================================================
  {
    name: "Gut Check",
    questions: [
      {
        key: "trust_score",
        dynamicPrompt: (a) =>
          `On a scale of 1-10, how much do you trust ${a.candidate_name || "them"} with a major financial commitment?`,
        prompt: "On a scale of 1-10, how much do you trust them with a major financial commitment?",
        type: "number_scale",
        min: 1,
        max: 10,
      },
      {
        key: "key_comfort",
        dynamicPrompt: (a) =>
          `Would you feel comfortable if ${a.candidate_name || "they"} had a key to your home while you were away for a month?`,
        prompt: "Would you feel comfortable if they had a key to your home while you were away for a month?",
        type: "chips",
        options: [
          { label: "Completely comfortable", value: "completely" },
          { label: "Mostly — but I'd set ground rules", value: "mostly" },
          { label: "I'd be a bit nervous", value: "nervous" },
          { label: "No", value: "no" },
        ],
      },
      {
        key: "exit_conversation",
        prompt: "If things didn't work out, could you have a civil conversation about selling?",
        type: "chips",
        options: [
          { label: "Definitely — we'd handle it maturely", value: "definitely" },
          { label: "Probably — uncomfortable but doable", value: "probably" },
          { label: "I'm not sure", value: "unsure" },
          { label: "I worry about that", value: "worried" },
        ],
      },
    ],
  },
]

export const COBUYER_GREETING =
  "Let's privately assess someone you're considering as a co-ownership partner. I'll walk you through 7 areas — this takes about 10 minutes. Everything here stays between us."
