Scaffold a new exercise for the Tomi journey system. Follow the existing patterns exactly.

Ask for:
1. Exercise name (e.g., "Exit Intentions")
2. Exercise ID slug (e.g., "exit_intentions")
3. Exercise category (from enum: gems_discovery, financial_planning, relationship_building, legal_preparation, home_search, cobuyer_assessment, home_vision)
4. Render mode: conversational, walkthrough, or form
5. Number of stages/questions

Then create:
1. **Prompt file:** `src/lib/{exercise-id}/prompts.ts` — system prompt for Homi facilitation
2. **Stages file:** `src/lib/{exercise-id}/stages.ts` — question definitions with dynamic prompts
3. **Types file:** `src/lib/{exercise-id}/types.ts` — response type definitions
4. **Context entry:** Add to `src/lib/exercise-contexts.ts` with behavioral instructions
5. **Page route:** `src/app/(app)/journey/{exercise-id}/page.tsx` — exercise page wrapper

Follow patterns from `src/lib/gems-exercise/` for conversational exercises or `src/lib/home-vision-exercise/` for configurator exercises.

Pass `currentPage` to `useHomiChat` in the component and add a context entry in `exercise-contexts.ts` per CLAUDE.md instructions.
