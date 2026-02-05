# Architecture Decision Records (ADR)

| Version | 1.0 |
| :---- | :---- |
| **Status** | Living Document |
| **Author** | Tomi Engineering |
| **Created** | February 2026 |
| **Last Updated** | February 5, 2026 |

---

## ADR-001: Supabase as Primary Data Access Layer (Client-Side)

| Attribute | Value |
| :---- | :---- |
| **Date** | February 2026 |
| **Status** | Accepted |
| **Relates to** | PRD-001 |

### Context

The codebase initially had two data access patterns:
1. **Supabase client** — Used by `useAuth` hook and client-side components to query the `profiles` table directly via `@supabase/ssr`
2. **Drizzle ORM** — Used by API routes (`/api/users/me`) with a direct Postgres connection via `DATABASE_URL`

This created a split where the client-side auth flow created profiles via Supabase, but the API route expected to read/write them via Drizzle. Schema drift between Supabase migrations and Drizzle migrations caused failures (e.g., missing `timezone` column).

### Decision

Standardize on the **Supabase client** for all profile and auth-related data access, both client-side and server-side (API routes). The `/api/users/me` route was rewritten to use `createServerSupabaseClient()` instead of Drizzle.

Drizzle ORM remains available for future use cases that require complex queries, transactions, or joins that Supabase's PostgREST API doesn't support well (e.g., financial modeling in PRD-010).

### Consequences

- **Positive:** Single source of truth for schema (Supabase migrations). No drift between two migration systems.
- **Positive:** RLS policies apply consistently whether data is accessed client-side or server-side.
- **Positive:** Simpler mental model — one query pattern for auth-related data.
- **Negative:** Drizzle's type safety for profile queries is lost. Supabase queries return `any` unless we manually type them.
- **Mitigation:** The `Profile` type in `src/types/user.ts` serves as the shared type contract.

---

## ADR-002: Separate Marketing and App Navigation

| Attribute | Value |
| :---- | :---- |
| **Date** | February 5, 2026 |
| **Status** | Accepted |
| **Relates to** | PRD-001, PRD-002 |

### Context

The application serves two distinct audiences on the same domain:
1. **Anonymous visitors** — Browsing marketing pages (homepage, how-it-works, assessment, calculator)
2. **Authenticated users** — Using the app (dashboard, settings, buying parties)

A single `Navbar` component was handling both cases, which made it difficult to provide focused navigation for each context. The marketing navbar showed app links (Dashboard, Settings) in a dropdown for logged-in users, while app pages showed irrelevant marketing links (Storytime, Assessment).

### Decision

Create two separate navigation components:

1. **`Navbar`** — Marketing navigation. Shows How It Works, Storytime, Assessment. For authenticated users, adds a prominent "Dashboard" button and compact avatar dropdown.
2. **`AppNavbar`** — App navigation. Shows Dashboard, Calculator, Parties. Compact (h-14 vs h-16/20). No footer.

Route-based rendering is controlled by:
- **`LayoutProvider`** — Context provider that exposes `isAppRoute`, `isMarketingRoute`, `isAuthenticatedOnMarketing`, and `mode` ("marketing" | "app")
- **`ConditionalNavbar` / `ConditionalFooter`** — Wrapper components in root layout that render marketing nav/footer only on non-app routes
- **App route layouts** (`/dashboard/layout.tsx`, `/settings/layout.tsx`, `/parties/layout.tsx`) — Each renders `AppNavbar` directly

App routes are defined as: `/dashboard`, `/settings`, `/parties`. Everything else is treated as marketing.

### Consequences

- **Positive:** Each navigation is focused for its context. Marketing pages don't show app-specific links; app pages don't show marketing links.
- **Positive:** The `LayoutProvider` makes route context available globally, so any component can adapt behavior based on whether the user is in the app or on marketing pages.
- **Positive:** Footer is hidden on app pages, creating a more app-like feel.
- **Negative:** Three separate layouts for app routes (`dashboard`, `settings`, `parties`) each render `AppNavbar` independently. This is slightly repetitive but avoids a nested layout that would conflict with Next.js's layout hierarchy.
- **Future:** Could introduce a shared `/app` route group with a single layout if the pattern becomes unwieldy.

---

## ADR-003: Lead Capture Before Assessment Results

| Attribute | Value |
| :---- | :---- |
| **Date** | February 4, 2026 |
| **Status** | Accepted |
| **Relates to** | Marketing, PRD-001 |

### Context

The co-ownership readiness assessment generates a grade (A-D) and score. Originally, results were shown immediately with no capture mechanism. Users could complete the assessment and leave without any way to follow up.

### Decision

Insert a **pre-results gate** (`PreResultsGate.tsx`) between assessment completion and results display. The gate offers three paths:

1. **Email capture** — Enter email to see results. Creates a lead in the `leads` table and triggers an email notification via Resend.
2. **Create account** — Redirects to signup with assessment data stored in `sessionStorage` for retrieval post-registration.
3. **Share/Invite** — Copy link or use native share to invite others to take the assessment.
4. **Skip** — View results without providing any information.

Leads are stored in a dedicated `leads` table with source tracking (assessment, calculator, chat, newsletter), UTM parameters, and referrer data. Email notifications are sent to `hello@livetomi.com` via the Resend API.

### Consequences

- **Positive:** Captures contact information for high-intent users who completed the full assessment.
- **Positive:** Skip option means no hard gate — users can always see their results.
- **Positive:** Assessment data persists in `sessionStorage` so it can seed the user's profile or Homi context after account creation.
- **Positive:** Email notifications ensure the team is alerted immediately when leads come in.
- **Negative:** Additional API route and table to maintain.

---

## ADR-004: Assessment Context Piped to Homi AI

| Attribute | Value |
| :---- | :---- |
| **Date** | February 4, 2026 |
| **Status** | Accepted |
| **Relates to** | PRD-002 |

### Context

After completing the assessment, users may interact with Homi (the AI chat assistant). Without assessment context, Homi asks generic questions that the user already answered in the assessment, creating a repetitive experience.

### Decision

Assessment results are automatically passed to Homi's system prompt when available. The pipeline:

1. `PreResultsGate` stores assessment data in `sessionStorage` (key: `pendingAssessment`)
2. `useHomiChat` hook checks for stored assessment data on mount
3. `buildAssessmentContextForHomi()` in `src/lib/assessment-context.ts` converts raw scores into a natural-language context summary with:
   - Overall grade and description
   - Category-specific insights (intent, co-buyer readiness, financial, commitment)
   - Actionable follow-up suggestions for Homi
4. This context is sent as `assessmentContext` in the chat API body
5. `buildSystemPrompt()` in `src/lib/prompts.ts` appends it to Homi's system prompt

### Consequences

- **Positive:** Homi can reference specific assessment answers and provide personalized guidance.
- **Positive:** No redundant questions — Homi knows what the user already told the assessment.
- **Positive:** Context is session-scoped (sessionStorage), so it naturally clears when the browser closes.
- **Negative:** System prompt grows larger with assessment context, increasing token usage.
- **Future:** When users have persistent accounts (PRD-002), assessment data should be stored server-side and loaded from the user's journey record rather than sessionStorage.

---

## ADR-005: Supabase Auth with Client-Side Profile Auto-Creation

| Attribute | Value |
| :---- | :---- |
| **Date** | February 2026 |
| **Status** | Accepted |
| **Relates to** | PRD-001 |

### Context

Supabase Auth manages user accounts (email/password, Google OAuth, magic links, phone OTP). The `profiles` table extends `auth.users` with app-specific data. A database trigger (`handle_new_user`) is intended to create a profile row when a user registers, but this trigger may fail silently for OAuth users or in edge cases.

### Decision

The `useAuth` hook implements **defensive profile auto-creation**:

1. On session load, it queries the `profiles` table for the user's profile
2. If the query returns `PGRST116` (row not found), it creates a profile row with `id`, `email`, and `full_name` from the auth user's metadata
3. This runs on both initial load and auth state changes (`onAuthStateChange`)

For the `SIGNED_IN` event specifically, a 500ms delay is added before querying the profile to allow the database trigger time to execute first.

### Consequences

- **Positive:** Users never get stuck on a loading screen because their profile doesn't exist.
- **Positive:** Works for all auth providers (email, Google, phone) regardless of trigger behavior.
- **Negative:** The 500ms delay on `SIGNED_IN` is a heuristic. If the trigger is slow, the client may still create a duplicate attempt (which the `insert` handles gracefully via the primary key).
- **Future:** Consider moving to a server-side middleware check that ensures profile existence before rendering app pages.

---

## ADR-006: Middleware for Route Protection

| Attribute | Value |
| :---- | :---- |
| **Date** | February 2026 |
| **Status** | Accepted |
| **Relates to** | PRD-001 |

### Context

Protected routes (`/dashboard`, `/settings`, `/parties`) must not be accessible to unauthenticated users.

### Decision

Next.js middleware (`src/middleware.ts`) handles route protection server-side:

1. On every request matching the path pattern, it creates a Supabase server client with cookie-based auth
2. It calls `supabase.auth.getUser()` to refresh the session and verify the user
3. If the user is not authenticated and the path is protected, it redirects to `/?signin=true&redirect={path}`
4. The marketing Navbar picks up the `signin=true` query param and opens the auth modal

Protected paths are defined in the middleware: `/dashboard`, `/settings`, `/parties`.

### Consequences

- **Positive:** Unauthenticated users never see protected page content — redirect happens before the page renders.
- **Positive:** The redirect preserves the intended destination via the `redirect` query param for post-login navigation.
- **Positive:** Session cookies are refreshed on every request, preventing stale sessions.
- **Negative:** Middleware runs on every matching request, adding latency. Mitigated by the path matcher excluding static files and images.

---

## ADR-007: Resend for Transactional Email

| Attribute | Value |
| :---- | :---- |
| **Date** | February 4, 2026 |
| **Status** | Accepted |
| **Relates to** | Lead capture |

### Context

The team needs email notifications when leads come in (assessment completions, newsletter signups, etc.). A transactional email provider is needed.

### Decision

Use **Resend** with the verified domain `livetomi.com`. The from address is `hello@livetomi.com`. Lead notification emails are sent to the address configured in `LEAD_NOTIFY_EMAIL` (default: `cody@tomi.com`).

Email sending is fire-and-forget from the API response perspective — `sendNotificationEmail()` is called without `await` so it doesn't block the lead capture response.

### Consequences

- **Positive:** Simple API, good developer experience, reliable delivery.
- **Positive:** Non-blocking email sending means lead capture is fast for the user.
- **Negative:** If the email fails, the user's lead is still saved but the team isn't notified until they check the database. The `notified_at` column tracks whether notification was sent.
- **Future:** Will need Resend for more transactional emails (party invites, agreement notifications) as PRD-005 and PRD-009 are implemented.

---

## ADR-008: Supabase Migration Naming Convention

| Attribute | Value |
| :---- | :---- |
| **Date** | February 5, 2026 |
| **Status** | Accepted |
| **Relates to** | All PRDs |

### Context

`supabase db push` silently skips migration files that don't match the `<timestamp>_name.sql` pattern (e.g., `001_auth_and_parties.sql`, `001a_tables_and_policies.sql`). The original migrations used simple numbered prefixes and were never executed by the CLI. This caused critical issues:

1. **GRANT statements never ran** — Tables were created (likely via the Supabase dashboard SQL editor), but the `anon`, `authenticated`, and `service_role` PostgreSQL roles were never granted SELECT/INSERT/UPDATE permissions. This caused `42501 permission denied` errors on every PostgREST query.
2. **Triggers never ran** — The `handle_new_user` trigger for auto-creating profiles on signup was never installed.
3. **Silent failure** — The CLI outputs "Skipping migration..." but doesn't treat it as an error, making it easy to miss.

### Decision

1. All migration files must use the `YYYYMMDDHHMMSS_name.sql` timestamp format.
2. Renamed all existing migrations to comply: `001_*` → `20260101000000_*`, etc.
3. Supabase tables require **explicit GRANT statements** for `anon`, `authenticated`, and `service_role` roles. RLS policies alone are not sufficient — they filter rows, but table-level permissions must also be granted.
4. Every migration that creates a table must include the corresponding GRANT statements in the same file.

### Consequences

- **Positive:** All migrations will be picked up by `supabase db push` going forward.
- **Positive:** Clear convention prevents future silent skips.
- **Lesson learned:** Always verify migration output — "Skipping migration" warnings are critical failures in disguise.
- **Action item:** When creating new tables, always include: `GRANT SELECT, INSERT, UPDATE ON public.<table> TO authenticated;` (and similar for other roles as needed).

---

## Template for New Decisions

```markdown
## ADR-XXX: [Title]

| Attribute | Value |
| :---- | :---- |
| **Date** | [Date] |
| **Status** | Proposed / Accepted / Deprecated / Superseded |
| **Relates to** | [PRD references] |

### Context
[What is the issue or situation that motivates this decision?]

### Decision
[What is the change that we're proposing or making?]

### Consequences
[What becomes easier or harder as a result of this decision?]
```
