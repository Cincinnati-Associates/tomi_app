**TOMI**  Co-Ownership Platform

**Onboarding Experience PRD**

*v2.0  |  AI-Native  |  Mobile-First  |  Social-Led*

*"The assessment isn't intake. It's identity formation."*

# **1\. Vision & Design Philosophy**

Tomi's onboarding has one job before it has any other job: make the user feel seen. Not welcomed — seen. The assessment is the mechanism. The avatar name is the proof. The board is the stage.

Three design laws govern every decision in this document:

* Identity first — the platform reflects the user back at themselves before it asks anything of them

* Earned access — every unlock is earned through engagement, never given for completing a form

* Social gravity — the product is structurally incomplete without the co-buyer; every screen creates pull toward party formation

| Design Principle: Progressive Commitment Architecture Users move through four psychological stages: Curious → Convinced → Committed → Invested. Each stage has exactly one primary CTA. We never ask for stage-3 commitment from a stage-1 user. The assessment → avatar → board sequence is engineered to move a user from Curious to Committed in under 10 minutes. |
| :---- |

# **2\. KPI Framework & Success Metrics**

Three tiers of KPIs, sequenced by product lifecycle stage. P1 metrics are optimized first. P2 and P3 metrics become primary as the product matures. All KPIs are mobile-session-aware.

## **2.1  Primary KPIs — Activation (Optimize from Day 1\)**

| KPI | Tier | Target | Signal |
| :---- | ----- | :---- | :---- |
| **Assessment Completion Rate** | **P1** | \>72% of starts | Validates conversational UX \+ hook quality |
| **Assessment → Account Creation Rate** | **P1** | \>65% of completions | Validates profile card / avatar name desirability |
| **Time to Account Creation** | **P1** | \<12 min median | Validates friction profile of full funnel |
| **Same-Session Activation** | **P1** | \>50% complete both in 1 session | Validates momentum design |

## **2.2  Secondary KPIs — Party Formation (Optimize by Week 4\)**

| KPI | Tier | Target | Signal |
| :---- | ----- | :---- | :---- |
| **Buying Party Created Rate (D7)** | **P2** | \>35% of accounts | Validates social mechanic strength |
| **Party Invite Sent Rate (D7)** | **P2** | \>45% of party leaders | Validates viral loop trigger |
| **Invite Accept Rate** | **P2** | \>40% of invites | Validates invite message quality |
| **Full Party Formed (all members joined)** | **P2** | \>25% of parties (D14) | Validates party completion pull |
| **Party Alignment Score Generated** | **P2** | \>60% of full parties | Validates assessment completion by all members |

## **2.3  Tertiary KPIs — Legal Value Creation (Optimize by Week 8\)**

| KPI | Tier | Target | Signal |
| :---- | ----- | :---- | :---- |
| **Exercise 1A Completion Rate (D14)** | **P3** | \>50% of accounts | First legal builder engagement signal |
| **First TIC Clause Generated (D21)** | **P3** | \>35% of accounts | Core value delivery confirmation |
| **Group Exercise Initiated (D21)** | **P3** | \>30% of full parties | Consensus-building mechanic validation |
| **Homi Conversation Depth (D7 avg)** | **P3** | \>4 turns/session | AI concierge value validation |
| **Outreach Email Open Rate** | **P3** | \>42% | Lifecycle messaging quality |
| **SMS Response Rate (Day 1 nudge)** | **P3** | \>18% | Channel effectiveness baseline |

| ⚠️ Open Design Decision — Flag for Review The Party Scoreboard is currently designed as the DEFAULT HOME SCREEN post-onboarding. Rationale: it reinforces social accountability on every session open, which drives P2 metrics. Alternative: Scoreboard as secondary tab; board as default. Recommend A/B testing in Phase 3\. Decision needed before frontend architecture is locked. |
| :---- |

# **3\. Value Communication Framework**

At every step the user must know: what did I just earn, and what does it unlock next. This is not a tooltip system — it's a narrative layer built into every transition. The framework below defines what gets communicated at each gate, how it's communicated, and by whom (Homi vs. UI vs. system).

## **3.1  Value Delivery Map**

| START ASSESSMENT | YOU GET Homi introduces herself. You get a 5-min guided conversation that will tell you your co-ownership readiness profile, a personalized score, and your avatar identity. | UNLOCKS Board preview (fogged). Desire through partial visibility. No commitment required. |
| :---- | :---- | :---- |

| COMPLETE ASSESSMENT | YOU GET Your Co-Ownership Profile Card: readiness score (3 dimensions), your Party Archetype, 3 AI insights specific to your answers, market data for your metro, and your AI-generated avatar name. | UNLOCKS Account creation gate unlocks. Profile card is shareable. Avatar name revealed with animation. |
| :---- | :---- | :---- |

| CREATE ACCOUNT | YOU GET Your board unlocks. All three Day-1 spaces light up: Buying Party, Homi Concierge, Legal Builder Stage 1\. Your avatar token appears on the board. | UNLOCKS Party invite link generated. Homi shifts to persistent concierge mode with your full context. First personalized exercise recommended. |
| :---- | :---- | :---- |

| INVITE CO-BUYER(S) | YOU GET Party Scoreboard activates. You can see each member's readiness status, avatar, and progress. Party Alignment Score generates when all members complete assessment. | UNLOCKS Group exercises unlock. Collective TIC agreement shell created. Party-level milestones appear on board. |
| :---- | :---- | :---- |

| COMPLETE EXERCISE(S) | YOU GET Specific TIC agreement clause(s) populate in real-time. Homi provides analysis of your answer against your party's answers — alignment or gap flagged immediately. | UNLOCKS More board spaces unlock. Agreement completeness % increases. Consensus-building flow triggers if gap detected. |
| :---- | :---- | :---- |

## **3.2  In-Product Value Communication Rules**

* Every CTA button contains the value, not just the action — 'Unlock My Board' not 'Continue'

* Every completed action shows what it generated — exercise done \= clause preview with party alignment signal

* Every locked space shows a tooltip preview — the fog is transparent enough to create desire

* Homi narrates major milestones — avatar name reveal, party formation, first clause generated are all Homi moments

* Progress is always expressed in two units: personal progress AND party collective progress

# **4\. The Co-Ownership Readiness Assessment v2**

## **4.1  Design Principles for Assessment UX**

The assessment is a conversation, not a form. Every design decision should reinforce that distinction. Mobile-first means thumb-zone navigation, single-thought-per-screen, and zero keyboard entry unless strictly necessary.

| ✅ DESIGN DO One question visible at a time (card-by-card) Homi 'types' response before next question appears Tappable response cards (3-4 options max) \+ optional free text Progress shown as 5 dots, not a %, not a bar Homi personalizes each transition: uses prior answers in next question framing Auto-advance on selection (no 'next' button for card responses) Save state: local storage, 72h window if user drops | ❌ DESIGN DON'T No multi-question screens No dropdown menus No required text inputs in first 3 modules No percentage-based progress bar (creates anxiety) No back button that clears answers (back \= review, not redo) No 'skip' option on M1-M3 (optional on M4-M5 only) No email gate before assessment complete |
| :---- | :---- |

## **4.2  Assessment Modules v2 (Enhanced Questions)**

| M1 | Ownership Intent Why now? What are you really trying to build? |
| :---: | :---- |

* 'What's the real reason you're thinking about this now?' \[Cards: Tired of renting / Investment play / Help family / Life transition / Just exploring\]

* 'What does success look like for you in 10 years with this property?' \[Open text — short, seeded with placeholder: 'My home is...'\]

* 'How would you describe your timeline?' \[Cards: Ready now / 3-6 months / 6-12 months / Just researching\]

| M2 | The Party Who's in the room — even hypothetically? |
| :---: | :---- |

* 'Do you have someone in mind to buy with?' \[Cards: Yes, we've talked / Yes, haven't asked yet / Not yet / I'd consider it\]

* 'If yes — what's the relationship?' \[Cards: Partner/spouse / Friend / Parent or sibling / Colleague / Don't have someone yet\]

* 'How would you rate your alignment with this person on big financial decisions?' \[1-5 tap scale with emoji anchors: 😬 → 🤝\]

| M3 | Financial Posture Coordination readiness, not a credit check |
| :---: | :---- |

* 'What's your rough target price range?' \[Tappable bands: Under $300K / $300-500K / $500K-1M / $1M+\]

* 'How would you describe your down payment situation?' \[Cards: Still saving / Have some / Ready to move / Depends on co-buyer\]

* 'What's your biggest financial concern about co-buying?' \[Cards: Qualifying alone / Splitting costs fairly / What if someone wants out / Long-term equity split\]

| M4 | Coordination Comfort The real risk is people, not property |
| :---: | :---- |

* 'Have you ever made a major financial decision with another person?' \[Cards: Yes, went well / Yes, got complicated / No, but open to it / No, and nervous about it\]

* 'How do you typically handle disagreement in close relationships?' \[Cards: Talk it out directly / Need time to process / Avoid until it passes / Depends on stakes\]

* 'What would make you feel truly safe in a co-ownership arrangement?' \[Open text — short, seeded with: 'I'd need...'\]

| M5 | Location & Property Signal Powers TIC localization and market intelligence |
| :---: | :---- |

* 'What city or metro are you targeting?' \[Autocomplete city search — critical for Legal Agent jurisdiction\]

* 'What type of property are you most interested in?' \[Cards: Single family / Duplex / Multi-unit / Condo / Not sure yet\]

* 'How many co-buyers are you envisioning total (including you)?' \[Tap: 2 / 3 / 4 / 4+\]

## **4.3  Assessment UX Notes —** 

**Context:** Refactor the Co-Ownership Readiness assessment at `livetomi.com`. Dark theme, gold (`#F5C842`) accent, Tomi brand. Reference the existing component structure and question progression (Vision → People → Lifestyle → Finances → Readiness).

---

**1\. Single-panel, no-scroll layout**

Constrain the entire assessment to `100dvh` with `overflow: hidden`. All content must fit within the viewport — no scrolling at any breakpoint. Remove the Privacy/Terms links from the footer. Replace with a minimal footer containing:

* Tomi wordmark (small, muted \~40% opacity)  
* Social icons: X, Instagram, Facebook, LinkedIn (same muted treatment as current)  
* Keep it under 48px tall, pinned to bottom

---

**2\. Background image overlay per section**

Maintain a fixed full-bleed background layer (`position: fixed`, `z-index: 0`). Source 5 distinct Tomi home/lifestyle images — one per section (Vision, People, Lifestyle, Finances, Readiness). On section advancement, crossfade to the corresponding image using `opacity` transition (800ms ease). Apply a dark overlay on top (`rgba(15,15,20,0.78)`) so content remains legible. Images should feel ambient, not dominant.

---

**3\. Homi chat — rotating placeholder prompts**

The Homi input should cycle through short, topical placeholder strings that rotate every 3.5 seconds with a fade transition. Prompts should be contextually tied to the *active section*. Examples:

* Vision: `"What if I don't know the city yet?"` / `"Can I co-own in multiple cities?"`  
* People: `"Do I need a partner to start?"` / `"What if my co-owner is a stranger?"`  
* Finances: `"How do we split unequal contributions?"` / `"What credit score is needed?"`

Implement as a `string[]` map keyed by section, cycling with `setInterval` \+ CSS `opacity` fade.

---

**4\. Homi — single-exchange interaction**

When the user submits a question to Homi:

* Show the response inline below the input  
* **Hide the input field** after submission (do not show a new input box)  
* Display a subtle nudge after the response renders: `"← Back to assessment"` or a dismiss button that clears the response and restores the assessment flow  
* This enforces Homi as a clarification tool, not a chat thread

---

**5\. (Optional) Staggered shimmer on answer options**

On each question render/transition, apply a staggered shimmer sweep across the answer option buttons. Implementation:

```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

Apply a `linear-gradient` shimmer background to each button with increasing `animation-delay` (e.g., `0ms`, `120ms`, `240ms`, `360ms`). Run once on mount — not on hover. Keep it subtle: low-contrast gold shimmer on the dark button surface. Remove after animation completes (`animation-fill-mode: forwards`).

---

**Constraints:**

* Mobile-first, test at 390px width  
* All transitions must respect `prefers-reduced-motion`  
* No layout shift between questions — use `position: absolute` \+ fade for question swaps, not reflow

## **5\. Agentic Assessment Analysis & Avatar Identity**

## **5.1  The Analysis: What the AI Does With Answers**

On assessment completion, the Analysis Agent fires before the user sees any result. It has 3-5 seconds to synthesize all inputs into a Profile that feels impossible to have been generated by a questionnaire. This is the hardest UX problem in the onboarding and the most important one to get right.

| Analysis Agent System Prompt Spec (Summary) Inputs: All M1-M5 responses \+ location \+ party size \+ detected device \+ session duration Output 1 — Readiness Score: Three sub-scores (Financial Posture 0-100, Relational Alignment 0-100, Operational Clarity 0-100) \+ composite score. Output 2 — Party Archetype: One of 8 archetypes (see below). Must be justified by at least 2 specific answers. Output 3 — 3 AI Insights: Each insight MUST reference a specific answer. No generic observations. Forbidden phrases: 'many people', 'it's common', 'typically'. Output 4 — Avatar Name: Punchy, confident, AI-decided. See Section 5.2. Output 5 — First Exercise Recommendation: Randomized selection from a pool of 3 eligible exercises weighted by assessment gap signals. Framed as 'based on your answers' regardless of selection method. Output 6 — Market Signal: One data point about co-buying activity in user's stated metro. Pulled by Market Agent. |
| :---- |

## **5.2  The 8 Party Archetypes**

| ASSET-BUILDERS The Compound Architects — multi-gen family, long hold The Equity Duo — 2-person investment focus The First-Gen Ladder — first-time buyers, wealth-building framing | LIFE-BUILDERS The Nest Builders — primary residence, lifestyle focus The Community Anchors — stay-put, neighborhood roots The Flex Owners — dual-city / remote-work flexibility |
| :---- | :---- |

| TRANSITION TYPES The Recomposers — post-divorce/major life change The Bridge Builders — short-term co-own to solo-own plan | ASSESSMENT RULE Archetype requires minimum 2 answer signals Archetype description shown to user is 1 punchy line Full archetype analysis stored in user\_context for Legal Agent and Homi Agent use |
| :---- | :---- |

## **5.3  Avatar Name Generator**

The avatar name is the first moment the platform becomes personal. It must feel crafted, not computed. It should make the user screenshot it.

| Avatar Name Generation Rules Formula: \[Punchy Modifier\] \+ \[Creative Name Derivative\] \+ \[Earned Title\] Modifier sources: archetype, financial posture signal, or coordination style Name derivative: phonetic/cultural play on first name. NOT just 'CodyX'. Think: Kodai, C-Stack, The Bri, K-Founder. Title: reflects dominant trait from M4 coordination answers. Punchy and confident tone by default. Progressive reveal: Title is shown as '\[blank\] the \_\_\_' until first exercise completed — then revealed. Examples: 'Compound Kodai the Architect' | 'Equity Bri the Anchor' | 'Casa Marks the Visionary' | 'First-Gen K the Builder' Forbidden: anything that sounds like a HR personality test. No 'Organized', no 'Willing', no 'Collaborative'. Character limit: 28 characters max (mobile display constraint). User can request one AI-generated alternative. Cannot manually rename (preserves brand integrity). |
| :---- |

## **5.4  First Exercise Recommendation Logic**

| Randomized-Weighted Exercise Recommendation Pool: 3 eligible Stage 1 exercises based on biggest gap signal from assessment. Selection: randomized from pool (for A/B test data collection in Phase 1). Framing: ALWAYS presented as 'Based on your answers, I think you should start here' — regardless of selection method. Homi delivers the recommendation in a conversational message, not a UI card. Example: 'Your answers tell me you're clear on the investment thesis but haven't thought through exit scenarios yet. I'd start with the Exit Intentions exercise — it's the one that surprises most people.' Exercise options in pool: 1A (Ownership Vision), 1B (Financial Commitments), 1D (Exit Intentions) — 1C (Relationship Principles) reserved for post-party-formation. |
| :---- |

# **6\. The Party Scoreboard — Default Home Screen**

The Party Scoreboard is the app's default home state after onboarding. Think arena jumbotron meets real estate deal room. It shows everyone in the party, the collective deal status, and the path forward — all in one mobile-optimized screen.

## **6.1  Mobile Layout (Portrait, Thumb-Zone Optimized)**

| Scoreboard Screen — Zone Breakdown (Top → Bottom) ━━━ ZONE 1 (Top 20%) — DEAL HEADER ━━━   Property type icon \+ location tag  |  \# co-owners  |  ownership type badge (TIC)   Target price range (if set)  |  Party name  |  Deal completeness ring (0-100%) ━━━ ZONE 2 (Middle 35%) — PLAYER CARDS ━━━   Horizontal scroll row of avatar cards (one per party member)   Each card: avatar token \+ name derivative \+ readiness sub-scores (3 colored dots) \+ last active   Party leader card has crown indicator   Empty slots show 'Waiting for \[Name\]...' with pulse animation ━━━ ZONE 3 (Middle 25%) — COLLECTIVE PROGRESS ━━━   Paint-by-color progress strip: 5 horizontal segments \= 5 lifecycle phases   Each segment fills with party color as exercises complete in that phase   Active phase is highlighted with glow; future phases are greyed   Tap any segment → expands to show phase detail \+ which exercises done/pending ━━━ ZONE 4 (Bottom 20%) — NEXT ACTION RAIL ━━━   Homi message bubble: personalized nudge for the party's current bottleneck   Primary CTA: 'Continue' → deeplinks to recommended next exercise   Secondary: 'View Board' → expands full 3D board view |
| :---- |

## **6.2  Alignment & Misalignment Signals**

The scoreboard shows collective progress — not individual exercise answers. But it does surface alignment signals from completed exercises in a way that's useful without being invasive.

| SUMMARY VIEW (Default) Party alignment score: 0-100 composite Phase-level completion % Each member's overall readiness indicator (green/amber/red dot) Days since last activity per member | EXPANDED VIEW (Tap phase segment) Which exercises completed per member Alignment status per exercise: ✅ Aligned / ⚠️ Gap Detected / ⏳ Pending No individual answers shown — only alignment signal Gap detected → 'Start group discussion' CTA appears |
| :---- | :---- |

| Consensus-Building Flow (Gap Detected) When 2+ members complete the same exercise and a gap is detected, the Alignment Agent fires. Homi surfaces a neutral summary: 'You and \[Name\] see the exit strategy differently. This is normal — here's how to work through it.' A group exercise triggers: structured prompts each member answers, then a facilitated Homi session surfaces the path to consensus. All consensus outputs feed directly into the TIC agreement — the conflict resolution becomes a clause. No answer is ever shown to another party member without explicit consent from the author. Summary only until consent granted. |
| :---- |

# **7\. AI Agent Architecture v2**

## **7.1  Unified AI Data Model**

All agents operate from a single source of truth: the Unified User Context (UUC) object stored in Supabase. No agent has a private memory store. Every agent reads and writes to the UUC. Context is never lost between sessions, channels, or agent handoffs.

| Unified User Context (UUC) Schema — Key Objects user\_profile: { id, name, name\_derivative, avatar\_name, avatar\_title\_revealed, archetype, readiness\_scores, location, device\_preference } party\_state: { party\_id, party\_name, members\[\], alignment\_score, collective\_progress{}, active\_phase, deal\_metadata{property\_type, price\_range, co\_owner\_count} } assessment\_data: { responses{M1-M5}, completion\_timestamp, first\_exercise\_recommendation, archetype\_justification\[\] } exercise\_state: { completed\[\], in\_progress\[\], exercise\_outputs{}, gap\_flags\[\], consensus\_status{} } tic\_agreement: { clauses\_populated{}, completeness\_pct, jurisdiction, last\_generated, pending\_consensus\[\] } outreach\_state: { preferred\_channel, email, phone, last\_contact\_timestamp, nudge\_history\[\], opt\_out\_flags{} } conversation\_history: { homi\_threads\[\], last\_turn, open\_topics\[\], agent\_handoff\_log\[\] } |
| :---- |

## **7.2  Agent Roster v2**

| 🚪 INTAKE AGENT | TRIGGERS Page load, UTM source detected, returning anonymous session | OUTPUTS Personalizes landing context, launches Homi with session-appropriate opening, writes source data to UUC |
| :---: | :---- | :---- |

| 🧠 ANALYSIS AGENT | TRIGGERS Assessment module M5 completed (final module) | OUTPUTS Generates all 6 outputs: scores, archetype, insights, avatar name, first exercise rec, market signal. Writes to UUC. Triggers Profile Card render. |
| :---: | :---- | :---- |

| 🤖 HOMI AGENT | TRIGGERS Account created \+ any ongoing platform activity | OUTPUTS Primary conversational layer. Context-aware across all UUC objects. RAG-backed TIC law by jurisdiction. Facilitates exercises, surfaces gaps, celebrates milestones. |
| :---: | :---- | :---- |

| 🤝 ALIGNMENT AGENT | TRIGGERS New party member joins OR same exercise completed by 2+ members | OUTPUTS Computes party alignment score. Detects gaps. Generates consensus-building prompt. Writes gap flags to UUC. |
| :---: | :---- | :---- |

| ⚖️ LEGAL AGENT | TRIGGERS Exercise submitted OR consensus reached on gap item | OUTPUTS Generates jurisdiction-specific TIC clause from exercise output. Formats for agreement shell. Flags any legally ambiguous inputs for human review. |
| :---: | :---- | :---- |

| 📊 MARKET AGENT | TRIGGERS Location confirmed in M5 OR party deal metadata updated | OUTPUTS Pulls co-buying market data for metro. Feeds Homi with market-aware talking points. Updates deal\_metadata in UUC. |
| :---: | :---- | :---- |

| 📡 OUTREACH AGENT | TRIGGERS Inactivity triggers, milestone completions, party events, nudge schedule | OUTPUTS Unified dynamic outreach across Email → SMS → Homi proactive → In-app push (channel priority order). Personalizes every message from UUC. Manages opt-outs and frequency caps. |
| :---: | :---- | :---- |

| ⏰ NUDGE AGENT | TRIGGERS Cron: 24h, 72h, 7d inactivity | Party invite not accepted 48h | Exercise started not completed 36h | OUTPUTS Generates and queues outreach via Outreach Agent. Selects message variant based on user stage and gap signal. Writes nudge history to UUC. |
| :---: | :---- | :---- |

## **7.3  Outreach Agent — Channel Architecture**

Channel priority is user-preference-aware but defaults to the ranked sequence below. The Outreach Agent never sends redundant messages across channels for the same event.

| Channel Priority \+ Trigger Map 1\. EMAIL (primary) — Welcome/onboarding sequence, milestone summaries, party formation events, weekly progress digest    • Trigger: account creation → immediate welcome \+ profile card summary email    • Trigger: party formed → 'Your party is assembled' email with scoreboard preview    • Trigger: first clause generated → 'Your TIC agreement is taking shape' email with clause preview 2\. SMS (secondary) — High-urgency, time-sensitive, short-form    • Trigger: party invite sent but not accepted (48h) → SMS to invitee with party leader's name    • Trigger: 24h inactivity post-assessment (no account created) → SMS re-engagement    • Trigger: gap detected in party alignment → SMS to both parties with Homi deep-link 3\. HOMI PROACTIVE (tertiary) — In-session, context-rich, conversational    • Trigger: user opens app after 48h+ absence → Homi opens with contextual 'where we left off'    • Trigger: co-buyer completes exercise → Homi notifies party leader in-session    • Trigger: new clause generated → Homi presents clause and asks for reaction 4\. IN-APP PUSH (quaternary) — Ambient notifications only, low-friction    • Trigger: co-buyer joins party → push notification    • Trigger: party alignment score updates → push with score delta    • Max frequency: 2 push notifications per day per user |
| :---- |

| Outreach Agent Rules Never send same event via 2 channels within 4 hours Email and SMS require explicit opt-in (captured at account creation) All messages are generated by Claude with UUC context — no static templates Unsubscribe from any channel immediately suppresses that channel across all future sends Frequency cap: max 1 email/day, 2 SMS/week, 4 push/day during onboarding phase |
| :---- |

# **8\. Onboarding Flow — Mobile-First Screen Design**

## **8.1  Screen Architecture Principles**

* Single primary action per screen — one thumb tap advances the user

* All interactive elements in bottom 60% of screen (thumb zone)

* No horizontal scrolling in critical flows — vertical only

* Keyboard never appears in first 3 assessment modules — card taps only

* All transitions are gesture-native: swipe up to advance, swipe down to review

* Bottom navigation bar hidden during assessment flow — eliminate escape routes

## **8.2  Screen Flow — Gate 1 → Gate 2 (Pre-Auth)**

| S1 | Landing — The Hook First 15 seconds must create desire through partial visibility |
| :---: | :---- |

* Hero: board preview fills top 55% of screen, fog-of-war active, 3 lit spaces pulse gently

* Headline (bottom card): 'Your home. Split smart.' (A/B test variants)

* Sub-copy: 'Find out if co-ownership is right for you. 5 min. No signup.'

* CTA button (thumb zone): 'Take the Assessment →' — full width, violet

* Social proof strip: animated number '11,247 co-buyers in Minneapolis this year'

| S2 | Assessment — Module-by-Module Homi-led, card-tap UI, single question per screen |
| :---: | :---- |

* Screen header: Homi avatar (animated) \+ 'Hey, I'm Homi. Let's figure this out together.'

* Message bubble animates in (typing indicator → text reveal, 0.8s delay)

* Response options appear as tappable cards below message — full width, stacked

* Progress: 5 dots at top of screen. Active dot is filled violet. No percentages.

* Open text inputs (M1, M4 only): single-line, autofocus, send on return — minimal keyboard exposure

* Between modules: Homi delivers a 1-sentence observation using prior answers before next question

| S3 | Profile Card Reveal The delight moment — earned, visual, shareable |
| :---: | :---- |

* Full-screen animated reveal sequence: 3 seconds, non-skippable on first view

* Score counts up (0 → actual score) with haptic feedback at 50 and final number

* Archetype badge drops in with particle burst

* 3 AI insights slide in one at a time (0.4s stagger)

* Avatar name section: '\[Modifier\] \[Name Derivative\] the \_\_\_' — title blank pulses

* Below name: 'Complete your first exercise to reveal your full title'

* Share button: pre-fills 'I just found out I'm a \[Archetype\] on @tomiapp. \[link\]'

* Primary CTA (full-width, bottom): 'Unlock My Board →'

## **8.3  Screen Flow — Gate 2 → Gate 3 (Auth)**

| S4 | Account Creation Minimum friction. Phone-first. No password ever. |
| :---: | :---- |

* Profile card visible in top half (blurred/dimmed) — reinforce what they're about to access

* Bottom sheet slides up: 'Enter your number to save your board'

* Phone input with country code — auto-format as user types

* 'Or use email' text link below (not equal prominence)

* OTP screen: 6-digit tap input, auto-advance on 6th digit, auto-resend at 30s

* No name input, no password, no preferences screen — all captured via assessment

## **8.4  Screen Flow — Gate 3 (Board Unlock)**

| S5 | Board Unlock Sequence 8 seconds. The most important animation in the product. |
| :---: | :---- |

* Full-screen board loads — 100% fog

* Beat 1 (0-2s): fog clears from user's zone left-to-right, particle trail

* Beat 2 (2-4s): three spaces light up with staggered pop — Buying Party, Homi, Legal Builder

* Beat 3 (4-6s): user's avatar token drops onto board at start space with subtle bounce

* Beat 4 (6-8s): Homi message appears bottom-right: 'Welcome to your board, \[Avatar Name\]. Here's where I'd start...'

* Transition: board zooms out to Scoreboard default home state

| S6 | Scoreboard — Default Home Party progress, deal status, and next action in one view |
| :---: | :---- |

* ZONE 1: Deal Header — Location tag, property type icon, \# co-owners, TIC badge, deal ring

* ZONE 2: Player Cards — Horizontal scroll. User's card first. Empty slots pulse for missing members.

* ZONE 3: Progress Strip — 5 color segments. Phase 1 (Explore) partially filled from assessment data.

* ZONE 4: Homi Rail — 'Your party is missing one thing: a co-buyer. Invite them now.' \+ CTA

# **9\. Build Phases — AI Co-Build Plan**

| P1 | Assessment \+ Analysis \+ Avatar Weeks 1-3 | Intake \+ Analysis \+ Homi v1 |
| :---: | :---- |

* Assessment UI: Next.js \+ shadcn, mobile-first card-tap flow, M1-M5

* Analysis Agent: Claude API, 6-output prompt, profile card component

* Avatar name generator: Claude prompt spec, 28-char limit, progressive reveal logic

* Supabase: UUC schema, user\_profiles, assessment\_data tables

* Auth: Twilio OTP \+ magic link email fallback

* Outreach Agent v1: welcome email sequence only (Email channel)

| P2 | Board \+ Scoreboard \+ Party Weeks 4-6 | Alignment Agent \+ Outreach Agent v2 |
| :---: | :---- |

* Board shell: Spline embed, 3 spaces lit, fog-of-war, unlock animation sequence

* Scoreboard: 4-zone mobile layout, player cards, progress strip, Homi rail

* Party creation \+ invite link system (unique per party)

* Co-buyer mini-assessment (M1, M3, M5 only — abbreviated for invite path)

* Alignment Agent v1: party formation event, alignment score on full party

* Outreach Agent v2: SMS channel added, party invite nudge cadence

| P3 | Legal Builder \+ Consensus Flow Weeks 7-10 | Legal Agent \+ full Outreach Agent |
| :---: | :---- |

* Exercise UI: 1A-1D individual exercises, clause preview on completion

* Legal Agent: RAG pipeline, jurisdiction-specific TIC (CA, MN, TX, FL priority)

* Consensus-building flow: gap detection, group exercise trigger, Homi facilitation

* TIC agreement shell: live document that populates from exercise outputs

* Outreach Agent v3: all 4 channels, frequency caps, personalized lifecycle messaging

* Market Agent: metro co-buying data, Homi talking points integration

# **10\. Core Design Principles**

| The Six Laws of Tomi Onboarding 1\. IDENTITY BEFORE ACQUISITION — The platform must reflect the user back at themselves before it asks for their email. The avatar name is not a feature. It's the product's first proof of intelligence. 2\. VALUE BEFORE FRICTION — Every gate (account creation, party invite, exercise start) must be preceded by a moment of delivered value. No user should ever wonder 'why am I doing this?' 3\. SOCIAL IS THE ENGINE — The product is structurally incomplete without the co-buyer. Every screen creates pull toward party formation. Empty avatar slots are not UX debt — they're conversion mechanics. 4\. LEGAL IS THE PRODUCT — The TIC agreement builds from the first exercise. Not at the end of the journey. The user's work directly generates their legal document in real-time. 5\. CONSENSUS IS DESIGNED — Misalignment between co-buyers is not a failure state. It's a product state. Every gap triggers a structured resolution flow. Conflict becomes a clause. 6\. ONE INTELLIGENCE — Homi has full context at all times. No user repeats themselves. No agent is surprised by what another agent did. The UUC is sacred. |
| :---- |

***Built for the ones who build differently.***

Tomi Co-Ownership Platform  |  PRD v2.0  |  Mobile-First  |  AI-Native