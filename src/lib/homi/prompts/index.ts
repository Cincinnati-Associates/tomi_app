/**
 * Homi Prompt Tier System
 *
 * Routes to the correct system prompt based on user authentication state.
 *
 * Tier 1 "a Homi"   — Anonymous marketing concierge (no DB queries)
 * Tier 2 "your Homi" — Authenticated journey guide (full user knowledge)
 * Tier 3 "the Homi"  — Party-scoped home concierge (handled by HomeBase route)
 */

export { MARKETING_SYSTEM_PROMPT } from "./marketing";
export { JOURNEY_SYSTEM_PROMPT } from "./journey";
export { CONCIERGE_SYSTEM_PROMPT } from "./concierge";

export type HomiTier = "marketing" | "journey" | "concierge";

/**
 * Determine which Homi tier to use based on auth state.
 *
 * Tier 3 (concierge) is NOT returned here because it's handled by
 * a separate route (`/api/homebase/chat`). This function only routes
 * between Tier 1 and Tier 2 for the main `/api/chat` endpoint.
 */
export function resolveHomiTier(options: {
  isAuthenticated: boolean;
}): HomiTier {
  if (options.isAuthenticated) {
    return "journey";
  }
  return "marketing";
}
