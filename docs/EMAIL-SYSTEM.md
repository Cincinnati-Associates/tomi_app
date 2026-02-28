# Tomi Email System — Admin Guide

## How It Works

Emails are **code-driven** — templates are React components, timing is defined in API routes, and a Vercel cron job handles scheduled sends. There is no external ESP dashboard to manage; everything lives in this repo and the admin UI at `/admin/emails`.

### The Three Layers

1. **Templates** — React Email components in `src/lib/email/templates/`. These define what the email looks like and says.
2. **Triggers** — API routes that fire `sendEmail()` or `scheduleEmail()` when a user action occurs (registration, assessment, party creation).
3. **Cron** — A Vercel cron job (`/api/cron/email-sequences`) runs every 15 minutes, picks up scheduled emails, checks cancel conditions, and sends.

---

## Admin Dashboard (`/admin/emails`)

Navigate to **Admin > Emails** in the admin navbar. You'll see:

### Stats Cards
- **Last 7 days** — total emails processed
- **Sent (30d)** — successfully delivered in the last 30 days
- **Failed (30d)** — send failures (check error messages)
- **All time** — lifetime total
- **By Type** — breakdown showing how many of each email type were sent

### Send Log Tab
A paginated table of every email send attempt. Filter by:
- **Type** — party_invite, welcome, assessment_results, lead_nurture_1/2/3, onboarding_nudge
- **Status** — pending, sent, failed, skipped, bounced, delivered, opened, clicked

Each row shows: recipient, type, subject, status, and timestamp. Failed emails include error details.

### Sequence Queue Tab
Shows all **scheduled** emails waiting to be sent. Each row shows the recipient, type, scheduled time, and cancel condition. You can **manually cancel** any scheduled email by clicking the red Cancel button.

### External Monitoring
- **Resend Dashboard** (resend.com) — delivery analytics, bounce tracking, domain reputation. No code needed, just log in.
- **Drizzle Studio** (`npm run db:studio`) — query `email_sends` and `email_sequences` tables directly if you need raw data.

---

## Current Email Inventory

### Immediate Emails (sent on action)

| Email | Trigger | File |
|-------|---------|------|
| **Party Invite** | User creates a party and enters a co-buyer's email | `templates/party-invite.tsx` |
| **Welcome** | User registers an account | `templates/welcome.tsx` |
| **Assessment Results** | Lead completes assessment and submits email | `templates/assessment-results.tsx` |

### Scheduled Emails (sent by cron)

| Email | Delay | Cancel If | File |
|-------|-------|-----------|------|
| **Lead Nurture 1** — "What if you didn't have to buy alone?" | +3 days after lead capture | User signs up | `templates/lead-nurture.tsx` → `LeadNurture1Email` |
| **Lead Nurture 2** — "How much could you afford with a co-buyer?" | +7 days | User signs up | `templates/lead-nurture.tsx` → `LeadNurture2Email` |
| **Lead Nurture 3** — "People like you are buying homes together" | +14 days | User signs up | `templates/lead-nurture.tsx` → `LeadNurture3Email` |
| **Onboarding Nudge** — "Your journey is waiting" | +3 days after registration | User starts journey | `templates/onboarding-nudge.tsx` |

### Cancel Conditions
When the cron job picks up a scheduled email, it checks the cancel condition **before sending**:
- `user_signed_up` — Does this email exist in the `profiles` table? (Lead converted to user)
- `user_started_journey` — Does this user have a row in `user_journeys`?
- `user_active_within_days` — Was the user's profile updated within N days?

If the condition is met, the email is marked `cancelled` instead of sent.

---

## How to Make Changes

### Change email copy or design

Templates are `.tsx` files in `src/lib/email/templates/`. They use React Email components (`<Text>`, `<Button>`, `<Link>`, etc.) with inline styles. The shared layout and CTA button are in `templates/layout.tsx`.

**To edit the welcome email copy:**
1. Open `src/lib/email/templates/welcome.tsx`
2. Edit the `<Text>` content — it's plain JSX
3. Deploy (Vercel auto-deploys on push)

**To change a subject line:**
1. Open `src/lib/email/templates/index.ts`
2. Find the `subject` function for the email type
3. Change the returned string

**To change brand colors or the shared footer:**
1. Open `src/lib/email/constants.ts` (colors) or `templates/layout.tsx` (layout)

### Change email timing

Timing for scheduled emails is set where `scheduleEmail()` is called:

- **Lead nurture timing** → `src/app/api/leads/route.ts` (lines ~203-228)
  - `daysFromNow(3)` / `daysFromNow(7)` / `daysFromNow(14)`
  - Change the number to adjust the delay
- **Onboarding nudge timing** → `src/app/api/auth/register/route.ts` (line ~89)
  - `daysFromNow(3)` — change to delay the nudge

### Add a new email to an existing cadence

Example: add a 4th lead nurture email at day 21.

1. **Create the template** — add `LeadNurture4Email` in `templates/lead-nurture.tsx` (copy an existing one, change the content)
2. **Add the type** — add `'lead_nurture_4'` to the `EmailType` union in `types.ts` and add its data shape to `EmailDataMap`
3. **Register the template** — add the `lead_nurture_4` entry in `templates/index.ts`
4. **Schedule it** — in `src/app/api/leads/route.ts`, add another `scheduleEmail()` call with `daysFromNow(21)` alongside the existing three
5. **Update cancel logic** — in `src/app/api/auth/register/route.ts`, add `'lead_nurture_4'` to the `cancelSequences()` array so it gets cancelled when the lead signs up
6. Deploy

### Add a completely new email type

Example: a "party_welcome" email sent when someone accepts a party invite.

1. **Add the type** — add `'party_welcome'` to `EmailType` in `types.ts`, add its data to `EmailDataMap`
2. **Create the template** — new file `templates/party-welcome.tsx` using `EmailLayout` and `CtaButton`
3. **Register it** — add to `templates/index.ts`
4. **Wire the trigger** — find or create the API route where the action happens, call `sendEmail({ type: 'party_welcome', ... })`
5. Deploy

### Remove an email

1. Remove the `scheduleEmail()` call from the trigger route (or the `sendEmail()` call for immediate emails)
2. Optionally clean up the template file and registry entry
3. Any already-scheduled sequences for that type will still be in the queue — cancel them from `/admin/emails` or they'll send when due

---

## File Map

```
src/lib/email/
  types.ts              ← EmailType union, payload types, cancel conditions
  constants.ts          ← DEFAULT_FROM, brand colors, SITE_URL
  send.ts               ← sendEmail() — renders template, calls Resend, logs to DB
  sequences.ts          ← scheduleEmail(), cancelSequences(), daysFromNow()
  conditions.ts         ← evaluateCancelCondition() — checks DB at send time
  index.ts              ← barrel export

  templates/
    layout.tsx           ← Shared EmailLayout (header, footer, brand) + CtaButton
    party-invite.tsx     ← Party invite template
    welcome.tsx          ← Welcome/registration template
    assessment-results.tsx ← Assessment results with grade + profile
    lead-nurture.tsx     ← 3 lead nurture emails (Day 3, 7, 14)
    onboarding-nudge.tsx ← Nudge to start journey (Day 3 post-registration)
    index.ts             ← Template registry (maps EmailType → component + subject)

src/db/schema/email.ts           ← email_sends + email_sequences table definitions
src/db/migrations/0009_email_system.sql ← Migration SQL

src/app/api/cron/email-sequences/route.ts ← Vercel cron handler (every 15 min)
vercel.json                                ← Cron schedule config

Trigger points:
  src/app/api/parties/route.ts        ← Fires party_invite
  src/app/api/auth/register/route.ts  ← Fires welcome, schedules onboarding_nudge
  src/app/api/leads/route.ts          ← Fires assessment_results, schedules nurture 1/2/3

Admin:
  src/app/(app)/admin/emails/page.tsx              ← Dashboard UI
  src/app/api/admin/emails/route.ts                ← Send log API
  src/app/api/admin/emails/stats/route.ts          ← Stats API
  src/app/api/admin/emails/sequences/route.ts      ← Sequence queue API
  src/app/api/admin/emails/sequences/[id]/route.ts ← Cancel sequence API
```

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `RESEND_API_KEY` | Resend API key for sending emails | Yes (emails skip if missing) |
| `CRON_SECRET` | Bearer token for Vercel cron auth | Yes (for production cron) |
| `NEXT_PUBLIC_APP_URL` | Base URL for links in emails | Recommended (defaults to `https://livetomi.com`) |

---

## Dev Workflow

- **No API key?** Emails are marked `skipped` in the DB — no errors, no sends. Safe for local dev.
- **Preview templates locally:** Run `npx react-email dev` from the project root to get a local preview server for all templates (hot-reload as you edit).
- **Test a real send:** Set `RESEND_API_KEY` in `.env.local`, trigger the action (register, submit assessment, create party with an email), check your inbox.
- **Check the DB:** `npm run db:studio` → browse `email_sends` and `email_sequences` tables.

---

## What's NOT in the Admin UI (and Why)

The admin dashboard is **monitoring + manual cancel** only. You cannot edit email templates or timing from the UI. This is intentional:

- **Templates change rarely** — a code deploy is the right workflow for copy changes. It gives you version control, review, and rollback for free.
- **A WYSIWYG editor is a big lift** — and fragile. React Email templates give you pixel-perfect control with real components. An editor would be a lossy abstraction.
- **You have Claude Code** — saying "change the welcome email CTA to say 'Explore Your Dashboard'" is faster than any admin UI.

### What could be worth adding later

- **Preview + Test Send** on the admin page — pick a template, see the rendered HTML, send a test to yourself. High value, small scope.
- **Resend webhook endpoint** (`/api/webhooks/resend`) to update `email_sends` with `delivered/opened/clicked/bounced` status. The DB schema already supports these statuses.
- **A/B subject lines** — the template registry could return multiple subjects with weights. Not needed until you have enough volume to test.
