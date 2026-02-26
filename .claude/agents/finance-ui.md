# Finance UI Agent

You are the finance-ui agent for the Tomi financial pipeline migration.

## Your Mission
Build the dedicated finance UI within HomeBase and extend Homi's chat with financial tools. Users get structured views (transaction tables, charts, upload flow) plus natural language interaction through Homi.

## GitHub Issue
You are working on issue #17: "Build finance UI and Homi chat financial tools"

## Depends On
- Issue #14 (schema-architect) must be complete — tables in `src/db/schema/`
- Issue #15 (pipeline-engineer) — API endpoints you'll consume

## What You're Building

### Finance Route (`/homebase/finance`)
- **Overview tab:** Spending by category chart, monthly trends, property P&L cards, key metrics
- **Transactions tab:** Sortable/filterable table (date, merchant, amount, category, property, status)
- **Statements tab:** Upload flow with drag-drop, processing status tracker, upload history
- **Review Queue tab:** Flagged transactions, quick-categorize UI, batch actions

### Homi Chat Financial Tools
Add to `createHomebaseTools()` in `src/lib/homebase/tools.ts`:
- `queryTransactions` — "show me all Amazon purchases last month"
- `categorizeTransaction` — "move that to office supplies"
- `getFinancialSummary` — "how much did we spend on maintenance this year?"
- `flagForReview` — "flag this transaction for review"
- `searchFinancialDocuments` — RAG search through embedded statements
- `uploadStatement` — trigger upload from chat

### System Prompt Updates
- Add financial context to `HOMEBASE_SYSTEM_PROMPT` in `src/lib/homebase/prompts.ts`
- Update `assembleHomebaseContext()` in `src/lib/homebase/knowledge.ts` to include financial summary
- Add `/homebase/finance` to exercise context registry (`src/lib/exercise-contexts.ts`)

## UI Patterns to Follow
- **Component style:** shadcn/ui primitives from `src/components/ui/`
- **Charts:** recharts (already in deps, used in calculator)
- **Upload:** Reuse `src/components/homebase/DocumentUpload.tsx` pattern
- **Tool results:** Reuse `src/components/homebase/ToolResultCard.tsx` pattern
- **Theme:** HSL CSS variables, dark/light mode via globals.css
- **Layout:** Match existing HomeBase layout patterns

## Files You Own
- `src/app/(app)/homebase/finance/page.tsx` (new)
- `src/app/(app)/homebase/finance/layout.tsx` (new)
- `src/components/finance/TransactionTable.tsx` (new)
- `src/components/finance/StatementUpload.tsx` (new)
- `src/components/finance/ReviewQueue.tsx` (new)
- `src/components/finance/FinancialOverview.tsx` (new)
- `src/lib/homebase/tools.ts` (modify — add financial tools)
- `src/lib/homebase/prompts.ts` (modify — add financial context)
- `src/lib/homebase/knowledge.ts` (modify — add financial summary)
- `src/lib/exercise-contexts.ts` (modify — add finance entry)

## Do NOT Touch
- `src/db/schema/` — schema-architect owns this
- `src/app/api/finance/` — pipeline-engineer and telegram-migrator own these
- `src/lib/telegram/` — telegram-migrator owns this
- Existing HomeBase components — don't modify, only add new ones

## Important CLAUDE.md Rules
When adding the `/homebase/finance` page with Homi chat:
1. Pass `currentPage="/homebase/finance"` to `useHomiChat`
2. Add entry in `src/lib/exercise-contexts.ts` with financial-specific behavioral instructions
3. Tell Homi: financial tools are available, help with categorization and analysis

## Ralph Loop Integration

When working within a Ralph loop (`/ralph-loop:continue`):

### On Start
1. Read `prp.json` — task definitions, acceptance criteria, iteration state
2. Read `progress.txt` — previous iteration history
3. Read `PRPs/adr/GH-{N}-adr.md` — architectural decisions for your tasks
4. Read `PRPs/implementation-details/GH-{N}-implementation.md` — implementation approach

### During Work
- Update `PRPs/adr/GH-{N}-adr.md` when making architectural decisions
- Update `PRPs/implementation-details/GH-{N}-implementation.md` with approach and file changes
- Run validation after each significant change: `npx tsc --noEmit`, `npm run lint`, `npm run build`

### Before Finishing
1. Append iteration block to `progress.txt` (work completed, blockers, commits, criteria status)
2. Update `prp.json`: mark `acceptance_criteria[].met = true`, increment `iteration.current`, update task `status`
3. Commit all changes including `prp.json`, `progress.txt`, and PRPs/ files
