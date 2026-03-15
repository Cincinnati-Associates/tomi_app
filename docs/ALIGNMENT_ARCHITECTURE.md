# Party Alignment Architecture

> Design document for comparing individual exercise responses across party members,
> identifying alignment/misalignment areas, considering jurisdiction + entity type,
> and feeding TIC agreement drafting. This is the $10K+ legal services value-add.
>
> **Status:** Architecture design only. No code changes yet.

---

## Overview

When all members of a buying party complete their individual exercises, the alignment
engine compares their responses across dimensions that map to TIC agreement sections.
For each section, it produces an alignment score (0-100) and severity classification.

This turns individual self-discovery exercises into a group alignment tool — the bridge
between "I know what I want" and "we agree on how this works."

---

## Schema Additions

### New columns on `buying_parties`

```sql
ALTER TABLE buying_parties
  ADD COLUMN jurisdiction_state text,
  ADD COLUMN jurisdiction_county text,
  ADD COLUMN jurisdiction_city text;
```

### New table: `party_member_entities`

Tracks the legal entity through which each member will hold their TIC interest.

```sql
CREATE TABLE party_member_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_member_id uuid NOT NULL REFERENCES party_members(id) ON DELETE CASCADE,
  entity_type text NOT NULL, -- see enum below
  entity_name text,
  entity_state text, -- state of formation
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Entity types:** `individual`, `single_member_llc`, `multi_member_llc`, `revocable_trust`,
`irrevocable_trust`, `married_couple_joint`, `married_couple_separate`

### New table: `agreement_sections`

Cached alignment analysis results per agreement section per party.

```sql
CREATE TABLE agreement_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES buying_parties(id) ON DELETE CASCADE,
  section_key text NOT NULL, -- matches ticSection values on journey phases
  alignment_status text NOT NULL DEFAULT 'pending', -- aligned/slight/moderate/significant/pending
  alignment_score integer CHECK (alignment_score >= 0 AND alignment_score <= 100),
  misalignment_areas jsonb DEFAULT '[]',
  last_analyzed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(party_id, section_key)
);
```

---

## Alignment Analysis Engine

**Location:** `src/lib/alignment/`

### Agreement Section → Data Source Mapping

| Section | Exercises | Key Dimensions |
|---------|-----------|----------------|
| Parties & Ownership % | Co-Buyer Check-In (mutual) | Trust, financial transparency, relationship expectations |
| Financial Terms | Money Picture (all members) | Income, savings, debt, monthly comfort, credit |
| Use & Occupancy | Home Vision + Housing Prefs (all) | Home type, location, usage pattern, lifestyle |
| Transfer & Exit | Exit/Risk Prefs (all) | Risk tolerance, dispute resolution, hold period, buyout method |
| Property Description | Housing Prefs + Home Vision (all) | Property type, location, budget, features |

### Scoring Approach

**Categorical data — proximity maps:**
- Define "distance" between options (e.g., "3-5 years" and "5+ years" are adjacent = slight misalignment; "5+ years" and "no minimum" = significant)
- Each dimension has its own proximity map

**Numeric data — percentage difference thresholds:**
- < 10% difference → aligned
- 10-25% → slight
- 25-50% → moderate
- > 50% → significant

**Text responses:**
- Surfaced for human/Homi review, not auto-scored
- Flagged as "requires discussion" in misalignment_areas

**Alignment bands:**
- 80-100: Aligned — minimal discussion needed
- 60-79: Slightly misaligned — brief conversation recommended
- 40-59: Moderately misaligned — structured discussion needed
- 0-39: Significantly misaligned — facilitated conversation or mediation recommended

### Jurisdiction Considerations

**Community property states** (AZ, CA, ID, LA, NV, NM, TX, WA, WI):
- Flag if any married member's spouse is NOT a party member — spouse may need to sign
- Different rules for community property vs separate property contributions

**State-specific TIC statutes:**
- Some states have specific TIC partition rights
- Flag for attorney review when jurisdiction is set

**Entity type interactions:**
- Asymmetric liability positions between individual vs LLC vs trust members
- Different tax implications per entity type
- Some combinations require additional legal documentation

**Local ordinances:**
- Rent control implications if any member won't occupy
- Short-term rental restrictions affect usage patterns
- Flag if relevant to Use & Occupancy section

**Critical principle:** The engine flags WHAT QUESTIONS to raise for attorney review.
It does NOT provide legal advice.

---

## Party Alignment Knowledge Assembly

New function `assemblePartyAlignmentContext(partyId)` following the existing
`assembleHomebaseContext` pattern in `src/lib/homebase/knowledge.ts`.

### Data Flow

1. Query party + members + profiles
2. Query ALL members' exercise responses (for TIC-mapped exercises)
3. Query `agreement_sections` for cached alignment state
4. Query `party_member_entities` for entity types
5. Run alignment engine (or use cached data if fresh)
6. Return structured context for prompt injection

### Prompt Integration

When an authenticated user has an active party, the Tier 2 prompt receives both
individual knowledge AND party alignment context. The `resolveHomiTier` function
could distinguish `journey` vs `journey_party` to include the alignment layer.

Example prompt section:

```
### Party Alignment Summary
Party: "The Oak Street Group" (3 members)
Jurisdiction: California (community property state)

| Section | Score | Status |
|---------|-------|--------|
| Financial Terms | 72/100 | Slightly misaligned |
| Use & Occupancy | 91/100 | Aligned |
| Transfer & Exit | 45/100 | Moderately misaligned |

Key areas needing discussion:
- Monthly comfort ranges differ by 40% ($2,500 vs $4,200)
- Alex prefers mediation, Jordan prefers arbitration for disputes
- Min hold period: 3 years vs 7 years (significant gap)

⚠️ California community property: Sarah is married — spouse signature may be required.
```

---

## Dependency Order for Implementation

1. **Schema migration** — parties jurisdiction columns + entities table + agreement_sections table
2. **Alignment proximity maps** — define distance/scoring for each categorical dimension
3. **Alignment engine core** — `src/lib/alignment/engine.ts` with `analyzeSection()` and `analyzeParty()`
4. **Jurisdiction rules module** — start with CA, NY, TX, FL, WA (highest co-buying volume)
5. **Party alignment knowledge assembler** — `assemblePartyAlignmentContext(partyId)`
6. **Tier 2 prompt extension** — inject party alignment context when user has active party
7. **Agreement alignment dashboard UI** — visual display of alignment scores per section
8. **Agreement draft generation** — distant future, after alignment is proven valuable

---

## Open Questions

- Should alignment re-run automatically when any member updates an exercise, or only on demand?
- How do we handle parties where not all members have completed the same exercises?
- What's the minimum exercise completion threshold before alignment analysis is useful?
- Should the alignment dashboard be visible to all party members or only the party creator?
- How do we present misalignment without creating conflict? (Framing matters enormously.)
