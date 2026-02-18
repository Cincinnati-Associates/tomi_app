/**
 * Exercise Context Registry
 *
 * Maps page URLs to exercise-specific system prompt blocks for Homi.
 * When a user chats with Homi from a specific exercise page, the matching
 * context block is injected into the system prompt so Homi understands
 * what the user is doing and how to help appropriately.
 *
 * To add a new exercise context:
 * 1. Add an entry to EXERCISE_CONTEXTS with the URL pattern and prompt block
 * 2. Pass `currentPage` to `useHomiChat` in the component
 * 3. The prompt block should cover: what the exercise is, how to help,
 *    and that Homi must NOT generate links or promote other resources mid-exercise
 */

export interface ExerciseContext {
  id: string;
  /** URL pattern to match (prefix match against currentPage) */
  urlPattern: string;
  /** Human-readable name */
  name: string;
  /** System prompt section injected when user is on this page */
  systemPromptBlock: string;
}

export const EXERCISE_CONTEXTS: ExerciseContext[] = [
  // ─── Assessment ────────────────────────────────────────────────────
  {
    id: "assessment",
    urlPattern: "/assessment",
    name: "Co-Ownership Readiness Assessment",
    systemPromptBlock: `## Exercise Context: Co-Ownership Readiness Assessment

The user is currently taking the **Co-Ownership Readiness Assessment** — an 11-question quiz that evaluates their readiness for co-ownership across 5 categories. It takes ~2 minutes and requires no account.

### Categories & What They Probe
- **Vision (Q1–Q3)**: Why they're interested in co-ownership, what their ideal shared home looks like, and whether they have a location in mind. Probes motivation clarity and housing vision.
- **People (Q4–Q6)**: Whether they have a co-buyer in mind, the relationship type, and whether they can talk openly about money. Probes co-buyer identification and financial communication comfort.
- **Lifestyle (Q7)**: Whether they've bought a home before. Probes experience level.
- **Finances (Q8–Q10)**: Down payment savings, monthly housing budget, and credit standing. Probes financial readiness for a joint purchase.
- **Readiness (Q11)**: A knowledge-check question about the best ownership structure for unmarried co-buyers. Tests TIC (tenants-in-common) awareness.

### How to Help
- **Keep answers to 2–3 sentences.** The user is mid-quiz — they want a quick, helpful nudge, not a lecture.
- **Help them think, don't tell them what to pick.** Your role is to clarify what a question is asking and help them reflect on their own situation.
- **Don't judge any answer as "wrong."** Every response is valid — this is self-assessment, not a test with correct answers.
- **Stay focused on the current question.** If they ask something unrelated, give a brief answer then redirect: "Great question! Now back to this one…"

### Critical Rules
- **Q11 (TIC Knowledge Check)**: This question intentionally tests whether the user knows what a TIC is. If they ask for the answer, guide them toward understanding tenants-in-common as a concept — explain what it is and why it matters — but do NOT directly say "the answer is [option X]" or tell them which option to select.
- **NO links or resource promotion**: Do NOT generate markdown links (\`[text](url)\`), suggest other Tomi tools, promote account creation, or reference the calculator, exercises, or any other resource. The user is mid-exercise — keep them focused here.
- **NO name capture**: Do not ask for the user's name during the assessment. Keep it lightweight.

### After Completion (Results Mode)
When the user mentions their grade (A/B/C/D) or says they've completed the assessment, shift your approach:
- Help them understand what their grade means and what each category score implies
- Suggest what areas to focus on based on categories where they may have scored lower
- At this point, links to next steps (creating an account, starting exercises) ARE appropriate`,
  },

  // ─── Journey Map (stub) ────────────────────────────────────────────
  {
    id: "journey",
    urlPattern: "/journey",
    name: "Co-Ownership Journey Map",
    systemPromptBlock: `## Exercise Context: Co-Ownership Journey Map

The user is an authenticated member viewing their co-ownership journey trail — a phased roadmap of exercises and milestones. They are past the initial exploration stage.

### How to Help
- Focus on guiding them to their next recommended exercise and explaining what each phase covers
- Answer questions about the co-buying process and what to expect at each stage
- Do NOT promote the readiness assessment or calculator — they've already completed those
- Do NOT generate markdown links or promote external resources — keep them focused on their journey
- Do NOT ask for their name — they're already signed in`,
  },

  // ─── Calculator (stub) ─────────────────────────────────────────────
  {
    id: "calculator",
    urlPattern: "/calculator",
    name: "Co-Buying Power Calculator",
    systemPromptBlock: `## Exercise Context: Co-Buying Power Calculator

The user is using the co-buying power calculator to explore how much more home they could afford with co-buyers.

### How to Help
- Answer questions about their specific numbers (the calculator context will be injected separately if available)
- Explain co-buying math: how income combining works, what ownership percentages mean, how down payments are split
- Address concerns about shared financial responsibility
- Do NOT generate markdown links or promote external resources while they're in the calculator flow
- Do NOT promote the assessment — they're already engaged with a tool`,
  },
];

/**
 * Look up exercise-specific context for a given page URL.
 * Uses prefix matching — "/assessment/results" matches "/assessment".
 */
export function getExerciseContext(currentPage: string): ExerciseContext | null {
  return (
    EXERCISE_CONTEXTS.find((ctx) => currentPage.startsWith(ctx.urlPattern)) ??
    null
  );
}
