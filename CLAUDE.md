# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tomi is a marketing site for a co-ownership/co-buying home platform. It helps users understand tenants-in-common (TIC) structures and calculate affordability with co-buyers. The site features an AI chat assistant ("Homi") powered by streaming LLM responses.

## Commands

```bash
# Development
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check without emitting

# Database (Drizzle ORM)
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema directly (dev only, no migration files)
npm run db:pull      # Pull schema from database (introspection)
npm run db:studio    # Open Drizzle Studio GUI
```

### Custom Claude Commands

- `/db-migrate` - Run the full database migration workflow with safety checks
- `/db-migrate --dry-run` - Preview migration without applying
- `/db-migrate --studio` - Migrate and open Drizzle Studio
- `/blog` - Create a new blog post (interactive prompts for title, tags, etc.)
- `/blog "Post Title"` - Create a new blog post with the given title

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with CSS custom properties for theming
- **Animations:** Framer Motion for scroll-based and interactive animations
- **AI:** Vercel AI SDK with multi-provider support (Google/OpenAI/Anthropic)
- **Analytics:** PostHog
- **Backend:** Supabase (PostgreSQL) with Drizzle ORM
- **ORM:** Drizzle ORM with type-safe schema definitions

### Key Patterns

**Theme System:** Colors use HSL CSS variables defined in `globals.css`. Both light and dark modes are supported. Light mode uses sage green (`--primary: 153 37% 26%`) as primary; dark mode uses yellow (`--primary: 52 65% 70%`).

**Component Organization:**
- `components/home/` - Homepage sections (Hero, HowItWorks, UnlockSection, etc.)
- `components/calculator/` - Smart calculator with AI chat integration
- `components/calc/` - Ownership calculator (detailed proforma-style)
- `components/shared/` - Reusable components (HomiChat, ThemeToggle, etc.)
- `components/ui/` - Primitive UI components (shadcn/ui style)
- `components/layout/` - Navbar, Footer, MobileMenu

**AI Chat:** The `/api/chat` route handles streaming responses. It supports two input formats:
1. Homepage chat: `{ messages: [{role, content}...] }`
2. Calculator context: `{ message, history, calculatorContext }`

Provider is controlled by `AI_PROVIDER` env var (google/openai/anthropic). See `lib/ai-provider.ts`.

**Content Data:** Static content lives in `src/content/questions.ts` (heroQuestions, objectionCards, howItWorksSteps, tomiDifferenceFeatures).

**Blog System:** Markdown-based blog at `/blog`. Posts are stored as `.md` files in `src/content/blog/posts/` with metadata in `src/content/blog/index.ts`. Use `/blog` command to create new posts. Full documentation in `docs/BLOG.md`.

**Hooks:**
- `useHomiChat` - Chat with streaming, wraps Vercel AI SDK's `useChat`
- `useSmartCalculator` - Calculator state + AI integration
- `useTypewriter` - Text typing animation effect
- `useAnimatedValue` - Smooth number animations

**Homi Exercise Context Registry (`src/lib/exercise-contexts.ts`):**
When adding a new page, CTA path, or exercise where Homi chat is available, you MUST:
1. Pass `currentPage` (the URL path, e.g. `"/assessment"`) to `useHomiChat` in the component
2. Add a corresponding entry in `src/lib/exercise-contexts.ts` with exercise-specific behavioral instructions
3. The context block should tell Homi: what the exercise is, what help is appropriate, and that it must NOT generate markdown links or promote other resources while the user is mid-exercise
4. Resources in `src/lib/resources.ts` are auto-suppressed for the current page via `formatResourcesForPrompt(currentPage)`, but the exercise context provides deeper behavioral guidance

### Scroll Animations

Several components use Framer Motion's `useScroll` + `useTransform` for scroll-triggered effects (e.g., HowItWorks horizontal panels, UnlockSection reveals). The pattern:
```tsx
const { scrollYProgress } = useScroll({ target: containerRef, offset: [...] });
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
```

### CSS Utilities

Custom glow effects in `globals.css`: `.glow`, `.glow-hover`, `.glow-pulse`, `.glow-intense`. Button component has a `glow` variant.

## Environment Variables

Required in `.env.local`:
- `AI_PROVIDER` - "google" | "openai" | "anthropic"
- Provider-specific API key (GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` - Supabase connection string (use pooler URL for serverless)

## Database (Drizzle ORM)

### Schema Ownership Model

The database has two distinct ownership domains:

**App-Owned Tables** (`src/db/schema/`) - Managed by Drizzle migrations:
- `profiles` - User profiles (extends Supabase auth.users)
- `buying_parties`, `party_members`, `party_invites` - Co-buying groups
- `user_journeys`, `exercise_templates`, `user_exercise_responses` - Journey system (PRD-002)
- `visitor_sessions`, `chat_conversations`, `chat_messages`, `visitor_user_links` - Chat system
- `auth_audit_logs` - Auth event logging (PRD-001)

**External Tables** (`src/db/external/`) - Managed by n8n pipelines (READ-ONLY from app):
- Rentals: `properties`, `units`, `listings`, `reservations`, `guests`, `payouts`, etc.
- Financial: `financial_transactions`, `chart_of_accounts`, `vendors`, etc.
- AI/RAG: `ai_documents`, `ai_chunks`
- Operations: `audit_logs` (n8n's), `expense_review_queue`, etc.

**CRITICAL RULES:**
1. ONLY modify tables in `src/db/schema/` - these are app-owned
2. NEVER modify `src/db/external/` tables directly - n8n manages these
3. External tables provide TypeScript types and query support only
4. Drizzle migrations only affect app-owned tables

### Schema Files

App-owned (`src/db/schema/`):
- `enums.ts` - PostgreSQL enums (party_status, journey_stage, exercise_category, etc.)
- `profiles.ts` - User profiles (PRD-001)
- `parties.ts` - Buying parties, members, invites
- `journey.ts` - User journeys and exercises (PRD-002/003)
- `chat.ts` - Visitor sessions and chat history
- `audit.ts` - Auth audit logs (PRD-001)
- `relations.ts` - All app-owned table relations
- `index.ts` - Barrel export

External (`src/db/external/`):
- `enums.ts` - External enums (booking_status)
- `rentals.ts` - Properties, units, listings, reservations
- `financial.ts` - Transactions, accounts, vendors
- `ai.ts` - AI documents and chunks
- `operations.ts` - Audit logs, review queues
- `relations.ts` - External table relations
- `index.ts` - Barrel export

### Database Client
Import from `src/db/index.ts`:
```typescript
// App-owned tables (read/write)
import { db, profiles, buyingParties, userJourneys } from '@/db'

// External tables (read-only)
import { external } from '@/db'
const { properties, reservations } = external

// Simple query
const user = await db.query.profiles.findFirst({
  where: eq(profiles.id, userId),
})

// Query with relations
const party = await db.query.buyingParties.findFirst({
  where: eq(buyingParties.id, partyId),
  with: { members: { with: { user: true } } }
})

// Query external table (read-only)
const property = await db.query.properties.findFirst({
  where: eq(external.properties.id, propertyId),
})
```

### Migration Workflow (Supabase + Vercel + GitHub)

**Development workflow:**
1. Modify schema files in `src/db/schema/` (app-owned only!)
2. Run `/db-migrate` command (or `npm run db:generate && npm run db:migrate`)
3. Commit migration files to git
4. Push to GitHub → Vercel auto-deploys

**Production safety:**
- Migrations run automatically on Vercel deploy via build step
- NEVER run destructive migrations (DROP, column type changes) without backup
- Test migrations on Supabase staging branch first for major changes
- NEVER modify external tables - coordinate with n8n pipeline team

**Schema changes that require caution:**
- Dropping columns/tables → Data loss
- Changing column types → May fail if data incompatible
- Adding NOT NULL without default → Will fail if existing rows

### Drizzle Configuration
Config file: `drizzle.config.ts`
- Schema path: `./src/db/schema/index.ts` (app-owned only)
- Migrations output: `./src/db/migrations`
- Dialect: PostgreSQL (Supabase)

**Note:** External tables in `src/db/external/` are NOT included in migrations.

## PostHog Guidelines

From `.cursor/rules/posthog-integration.mdc`:
- Never hardcode API keys; use `.env.local`
- Minimize feature flag usage across callsites
- Use enums/const objects for flag names (UPPERCASE_WITH_UNDERSCORE)
- Consult existing naming conventions before creating new event/property names
