# Group Knowledge Architecture

How user data flows between individual and group Homi contexts. This document defines the privacy boundary for the collaborative agent experience.

## Core Principle: Consent-Based Escalation

Individual data NEVER silently enters the group context. Every piece of data in the group Homi's knowledge arrived through one of three paths:

1. **Inherent** — data that exists because the group exists (party name, member names)
2. **Derived** — safe aggregates computed from individual data (exercise completion count, readiness stage)
3. **Opted-in** — individual data the user explicitly chose to share (`party_member_shared_data` table)

## Three Data Layers

### Layer 1: PRIVATE (never enters group context)

| Data | Source | Why it's private |
|---|---|---|
| Assessment custom text answers | `visitor_user_links.merged_context` | May contain feelings about co-buyers |
| Assessment category insights | `merged_context.assessmentData` | Reveals financial/relational weaknesses |
| Exercise free-text responses | `user_exercise_responses.responses` | Personal reflections, concerns |
| Exercise computed scores | `user_exercise_responses.computed_scores` | Granular individual metrics |
| Individual budget range | `user_journeys.budget_range_low/high` | Financial capacity |
| Income range | `visitor_user_links.merged_context` | Financial capacity |
| Readiness score (numeric) | `user_journeys.readiness_score` | Too granular — stage is sufficient |
| Dimension profile growth areas | Assessment dimension analysis | Reveals vulnerabilities |
| Private Homi chat history | `chat_messages` | Individual coaching conversations |
| Phone number, email | `profiles` | PII |

### Layer 2: DERIVED (always available in group context)

| Data | Source | What's exposed |
|---|---|---|
| Exercise completion status | `user_exercise_responses.status` | "3/5 complete" + which slugs |
| Readiness stage | `user_journeys.stage` | "exploring" / "preparing" / "ready" — not the 0-100 score |
| Assessment grade | `merged_context.assessmentData.grade` | Letter grade only (A/B/C/D) |
| Party membership | `party_members` | Names, roles, join dates |
| Party info | `buying_parties` | Name, status, target city, group budget |

### Layer 3: OPTED-IN (requires explicit user action)

Stored in `party_member_shared_data`. Each row represents one data point one user chose to share.

| Data Key | Value Shape | Typical Stage |
|---|---|---|
| `budget_range` | `{ low: number, high: number }` | Active (preparing) |
| `down_payment` | `{ amount: number }` | Active (preparing) |
| `monthly_limit` | `{ amount: number }` | Active (preparing) |
| `income_range` | `{ range: string }` | Active (preparing) |
| `credit_tier` | `{ tier: "excellent"\|"good"\|"fair"\|"building" }` | Active (preparing) |
| `timeline` | `{ value: string }` | Active (preparing) |
| `location_preferences` | `{ areas: string[] }` | Forming |
| `property_type` | `{ types: string[] }` | Forming |
| `deal_breakers` | `{ items: string[] }` | Active |
| `ownership_split` | `{ percentage: number }` | Under contract |
| `exit_preferences` | `{ notice_period: string, buyout_method: string }` | Under contract |

## How Sharing Works

### Three Sharing Mechanisms

**1. Conversational (implicit in group chat)**

User says "I can do up to $400k" in group chat → the message is visible to all members but does NOT automatically write to `party_member_shared_data`. It's just chat. Homi can reference what was said in conversation but doesn't persist it as structured data.

**2. Journey-prompted (sharing cards)**

When the group reaches certain stages, the individual Homi (Tier 2) shows a sharing prompt:

> "Your group is aligning on finances. Choose what to share with the group."

This opens a sharing card UI with toggles per data key. Toggling on writes to `party_member_shared_data`. The user sees exactly what will be shared and can revoke later.

**3. TIC drafting (structured intake)**

During agreement drafting, all members complete a structured form where financial data is required. This data is inherently shared because it becomes part of the legal agreement. `shared_via` = `"tic_drafting"` and this data is NOT revocable post-agreement.

### Revocability

| Stage | Revocable? |
|---|---|
| Forming / Active | Yes — user can revoke any shared data from profile settings |
| Under Contract | Partial — agreement terms are locked, other data revocable |
| Closed | No — agreement data is part of legal record |

## Stage Gates

What's available at each party stage:

| Party Status | Default Context | Prompted Sharing | Required |
|---|---|---|---|
| `forming` | Names, avatars, exercise status | Location, property type | — |
| `active` | + readiness stage, assessment grade | Budget, down payment, monthly limit, timeline | — |
| `under_contract` | + all financial alignment data | — | Ownership %, contributions, exit terms |
| `closed` | Full party context (HomeBase) | — | — |

## Implementation

### Key Files

- `src/db/schema/shared-knowledge.ts` — Table definition + shareable data keys
- `src/db/migrations/0010_shared_knowledge.sql` — Migration with RLS policies
- `src/lib/group-knowledge.ts` — `assembleGroupKnowledge()` + `formatGroupKnowledgeForPrompt()`

### How assembleGroupKnowledge() Works

```
assembleGroupKnowledge(partyId)
  ├── Query buying_parties (name, status, city, budget)
  ├── Query party_members + profiles (names, roles, avatars)
  ├── Query user_journeys (stage ONLY — no scores, no budget)
  ├── Query user_exercise_responses (status + exercise_id ONLY — no responses)
  ├── Query visitor_user_links (assessment grade ONLY — no insights, no custom answers)
  ├── Query party_member_shared_data WHERE revoked_at IS NULL
  └── Assemble GroupKnowledge with clear layer separation
```

### Homi Behavioral Rules

The group Homi prompt includes these constraints:

1. **Never volunteer individual data** — Don't say "Sarah can afford $400k" even if you know it from shared data, unless directly asked or it's relevant to an active discussion
2. **Never prompt sharing in group chat** — Don't say "Sarah, want to share your budget?" The individual Homi handles sharing prompts privately
3. **Never speculate about unshared data** — If a member hasn't shared their budget, don't estimate it from other signals
4. **Defer to the agreement** — Once TIC drafting begins, reference "the agreement specifies X" rather than individual capacity
5. **Acknowledge data gaps** — "I don't have everyone's financial details yet" is a valid response

### Cross-Tier Data Flow

```
Tier 1 (anonymous) ──signup──→ Tier 2 (individual)
  │                                │
  │ assessment grade,              │ exercise status,
  │ stage, topics                  │ readiness stage,
  │ (via visitor_user_links)       │ assessment grade
  │                                │ (Layer 2 derivatives)
  │                                │
  │                                ├──opt-in──→ Group Homi
  │                                │            (Layer 3: shared data)
  │                                │
  │                                └──────────→ Tier 3 (HomeBase)
  │                                              (post-closing, full party context)

  Data flows UP only. Group chat never feeds back into individual Homi.
  Tier 2 (your Homi) always knows MORE than the group Homi.
```

### What the Group Homi CANNOT Access

Even with service role (bypassing RLS), `assembleGroupKnowledge()` deliberately does NOT query:

- `user_exercise_responses.responses` (individual answers)
- `user_exercise_responses.computed_scores` (individual metrics)
- `user_journeys.budget_range_low/high` (individual budget)
- `user_journeys.readiness_score` (numeric score)
- `visitor_user_links.merged_context` (beyond grade letter)
- `chat_messages` (individual Homi conversations)
- `profiles.email` / `profiles.phone` (PII)
