/**
 * Tier 3: "the Homi" — Shared Home Concierge
 *
 * For authenticated users with an active party, on HomeBase.
 * This prompt is already served by `/api/homebase/chat` via
 * `src/lib/homebase/prompts.ts`. This file re-exports it so
 * the tier system has a single import point, and documents
 * the tier boundaries.
 *
 * NOTE: In Phase 1, we do NOT change the HomeBase chat route.
 * It continues to use HOMEBASE_SYSTEM_PROMPT directly.
 * This file exists for documentation and future Phase 2 unification.
 */

export { HOMEBASE_SYSTEM_PROMPT as CONCIERGE_SYSTEM_PROMPT } from "../../homebase/prompts";

/**
 * Tier 3 boundaries (documented for prompt design):
 *
 * Persona: Authoritative, action-oriented, party-aware
 * Goals: Manage shared home, coordinate party, track tasks/docs
 * Data: Everything in Tier 2 + party members, documents (RAG), tasks, comments
 * Boundaries: Scoped to active party only
 *
 * The HomeBase prompt handles all of this already — tool calling,
 * document RAG, task management, etc. Phase 2 (#350) will unify
 * the routing so `/api/homi/concierge` replaces `/api/homebase/chat`.
 */
