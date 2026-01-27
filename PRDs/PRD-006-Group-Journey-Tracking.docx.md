# **PRD-006: Group Journey Tracking**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 1 — Group Formation |
| **Dependencies** | PRD-005 (Groups), PRD-003 (Exercises) |

# **1\. Overview**

This PRD defines the group journey tracking system — a non-linear, capability-based progress model that tracks individual and collective readiness for co-ownership. Unlike a traditional funnel, the system enables 'choose your own adventure' progression where groups can tackle milestones in their preferred order while the platform tracks dependencies, surfaces alignment insights, and provides AI-driven guidance.

## **1.1 Purpose**

Provide visibility into group progress across multiple dimensions: individual readiness, group alignment, external milestones, and TIC agreement completion. Enable flexible progression paths while ensuring critical dependencies are met. Surface AI-analyzed alignment and misalignment to guide productive group discussions.

## **1.2 Core Philosophy: Non-Linear Progression**

Traditional funnel models assume linear progression. Co-buying is messier. Groups may:

* Start with TIC discussions before financial qualification  
* Complete educational modules out of order based on interest  
* Have members at different readiness levels  
* Revisit completed sections as circumstances change  
* Work on multiple tracks simultaneously

The system embraces this reality by tracking capability completion rather than enforcing stage gates. Dependencies exist (e.g., TIC ownership section requires financial disclosure exercise), but within those constraints, groups have autonomy.

## **1.3 Progress Model Architecture**

Three-Layer Progress Tracking:

┌─────────────────────────────────────────────────────────────────┐  
│                      GROUP JOURNEY                              │  
│  Stage: aligning │ Target Close: 2025-06-01 │ Score: 72%       │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                 │  
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │  
│  │   TRACK 1    │  │   TRACK 2    │  │   TRACK 3    │          │  
│  │  Education   │  │  Alignment   │  │   External   │          │  
│  │  & Learning  │  │  & Agreement │  │  Milestones  │          │  
│  │   \[████░░\]   │  │   \[██░░░░\]   │  │   \[███░░░\]   │          │  
│  │    67%       │  │     33%      │  │     50%      │          │  
│  └──────────────┘  └──────────────┘  └──────────────┘          │  
│                                                                 │  
├─────────────────────────────────────────────────────────────────┤  
│  INDIVIDUAL PROGRESS                                            │  
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │  
│  │  Alex   │ │  Jordan │ │  Sam    │   Alignment Analysis:     │  
│  │  ████░  │ │  ███░░  │ │  ██░░░  │   2 items need discussion │  
│  │   80%   │ │   60%   │ │   40%   │                           │  
│  └─────────┘ └─────────┘ └─────────┘                           │  
└─────────────────────────────────────────────────────────────────┘

## **1.4 Success Criteria**

* Groups can complete milestones in any valid order (respecting dependencies)  
* Individual progress visible to all group members  
* AI alignment analysis surfaces discussion points within 60 seconds of exercise completion  
* Stage transitions occur automatically with admin override capability  
* Dashboard load time under 2 seconds

# **2\. User Stories**

* **US-1:** As a group member, I want to see overall group progress so I understand where we are in the journey.  
* **US-2:** As a group member, I want to see what milestones are available so I can choose what to work on next.  
* **US-3:** As a group member, I want to see each person's progress so I know who has completed what.  
* **US-4:** As a group member, I want to see alignment analysis so I know where we agree and disagree.  
* **US-5:** As a group admin, I want to mark external milestones complete so progress reflects real-world status.  
* **US-6:** As a group admin, I want to override stage transitions when automatic triggers don't match our situation.  
* **US-7:** As a group member, I want to log blockers so the team knows what's slowing us down.  
* **US-8:** As a group member, I want to see recommended next steps based on our current progress.

# **3\. Progress Tracks**

Progress is organized into three parallel tracks. Each track contains milestones that can be completed independently (within dependency constraints).

## **3.1 Track 1: Education & Learning**

Educational content and individual exercises that build knowledge and capture preferences.

| Milestone | Description | Type | Required |
| :---- | :---- | :---- | :---- |
| edu\_coownership\_101 | Introduction to co-ownership concepts | Module | Yes |
| edu\_tic\_basics | Understanding TIC structures | Module | Yes |
| edu\_financing\_options | Co-buying financing overview | Module | No |
| edu\_exit\_strategies | Exit planning fundamentals | Module | Yes |
| ind\_financial\_readiness | Individual financial assessment | Exercise | Yes |
| ind\_housing\_preferences | Individual housing preferences | Exercise | Yes |
| ind\_lifestyle\_arrangement | Individual lifestyle preferences | Exercise | Yes |
| ind\_risk\_tolerance | Risk tolerance assessment | Exercise | No |

## **3.2 Track 2: Alignment & Agreement**

Group exercises and TIC agreement sections that require collective input and decision-making.

| Milestone | Description | Type | Required |
| :---- | :---- | :---- | :---- |
| grp\_shared\_vision | Align on goals and timeline | Exercise | Yes |
| grp\_property\_criteria | Agree on property requirements | Exercise | Yes |
| grp\_financial\_contribution | Discuss contribution structure | Exercise | Yes |
| grp\_governance\_model | Agree on decision-making rules | Exercise | Yes |
| grp\_space\_allocation | Discuss space usage preferences | Exercise | No |
| tic\_ownership\_structure | TIC: Ownership percentages | Agreement | Yes |
| tic\_financial\_terms | TIC: Costs and contributions | Agreement | Yes |
| tic\_governance | TIC: Voting and decisions | Agreement | Yes |
| tic\_exit\_terms | TIC: Exit and buyout provisions | Agreement | Yes |
| tic\_dispute\_resolution | TIC: Conflict resolution process | Agreement | Yes |

## **3.3 Track 3: External Milestones**

Real-world activities outside the platform. Some auto-linked to partner referrals, others manually tracked.

| Milestone | Description | Auto-Link | Required |
| :---- | :---- | :---- | :---- |
| ext\_preapproval | At least one member pre-approved | Referral | Yes\* |
| ext\_agent\_engaged | Real estate agent hired | Referral | No |
| ext\_attorney\_engaged | Real estate attorney consulted | Referral | Yes\* |
| ext\_financial\_advisor | Financial advisor consulted | Referral | No |
| ext\_property\_identified | Target property selected | Property | Yes\* |
| ext\_offer\_submitted | Offer submitted on property | Manual | Yes\* |
| ext\_offer\_accepted | Offer accepted, under contract | Manual | Yes\* |
| ext\_inspection\_complete | Home inspection completed | Manual | Yes\* |
| ext\_appraisal\_complete | Appraisal completed | Manual | Yes\* |
| ext\_closing\_complete | Closing completed, property owned | Manual | Yes\* |

*\* Required for corresponding stage transition, not for platform use.*

# **4\. Milestone Dependencies**

While progression is non-linear, certain milestones have prerequisites. The system enforces these dependencies while allowing maximum flexibility elsewhere.

## **4.1 Dependency Rules**

| Milestone | Requires | Rationale |
| :---- | :---- | :---- |
| grp\_financial\_contribution | All members: ind\_financial\_readiness | Need financial context |
| grp\_property\_criteria | All members: ind\_housing\_preferences | Need preference input |
| tic\_ownership\_structure | grp\_financial\_contribution | Need contribution discussion |
| tic\_governance | grp\_governance\_model | Need governance discussion |
| tic\_exit\_terms | edu\_exit\_strategies | Need exit education first |
| ext\_offer\_submitted | ext\_property\_identified | Sequential dependency |
| ext\_offer\_accepted | ext\_offer\_submitted | Sequential dependency |

## **4.2 Dependency Enforcement**

* Locked milestones display with lock icon and missing prerequisite list  
* Clicking locked milestone shows path to unlock  
* Dependencies checked at milestone start, not completion  
* Admin override available for edge cases (logged)

# **5\. Individual Progress Tracking**

Each group member has individual progress tracked separately. This enables alignment analysis and surfaces who needs to complete what.

## **5.1 Individual Milestone Status**

| Status | Display | Description |
| :---- | :---- | :---- |
| not\_started | Empty circle | Milestone available but not begun |
| in\_progress | Half-filled circle | Started but not completed |
| completed | Checkmark | Fully completed |
| locked | Lock icon | Prerequisites not met |
| not\_applicable | Dash | Milestone not required for this member |

## **5.2 Progress Matrix View**

A matrix showing all members × all individual milestones:

┌────────────────────────┬───────┬────────┬───────┐

│ Milestone              │ Alex  │ Jordan │ Sam   │  
├────────────────────────┼───────┼────────┼───────┤  
│ Financial Readiness    │  ✓    │   ✓    │  ◐    │  
│ Housing Preferences    │  ✓    │   ◐    │  ○    │  
│ Lifestyle Arrangement  │  ✓    │   ○    │  ○    │  
│ Co-ownership 101       │  ✓    │   ✓    │  ✓    │  
│ TIC Basics             │  ✓    │   ○    │  ○    │  
└────────────────────────┴───────┴────────┴───────┘

Legend: ✓ Complete  ◐ In Progress  ○ Not Started  🔒 Locked

# **6\. Alignment Analysis**

When all members complete an individual exercise, the system triggers AI analysis to identify alignment and misalignment. This surfaces discussion points before they become conflicts.

## **6.1 Analysis Flow**

Trigger: Last member completes individual exercise

┌──────────────┐     ┌──────────────┐     ┌──────────────┐  
│  Individual  │────▶│   n8n        │────▶│  Alignment   │  
│  Responses   │     │   Webhook    │     │   Report     │  
└──────────────┘     └──────────────┘     └──────────────┘  
       │                    │                    │  
       │                    ▼                    ▼  
       │              ┌──────────────┐    ┌──────────────┐  
       │              │   Claude     │    │   Group      │  
       └─────────────▶│   Analysis   │───▶│   Dashboard  │  
                      └──────────────┘    └──────────────┘

## **6.2 Analysis Dimensions**

| Dimension | What It Measures | Example Output |
| :---- | :---- | :---- |
| Strong Alignment | Areas where all members agree | "All prefer single-family home" |
| Partial Alignment | Majority agreement with outliers | "2/3 prioritize walkability" |
| Misalignment | Significant disagreement needing discussion | "Timeline expectations differ: 3mo vs 12mo" |
| Data Gaps | Missing information preventing analysis | "Sam hasn't specified budget range" |

## **6.3 Alignment Report Structure**

AlignmentReport {

  "exercise\_slug": "housing\_preferences",  
  "analyzed\_at": "2024-12-15T10:30:00Z",  
  "overall\_score": 72,  // 0-100  
  "member\_count": 3,  
  "alignments": \[  
    {  
      "topic": "Property Type",  
      "status": "aligned",  
      "summary": "All members prefer single-family homes",  
      "responses": { "alex": "single\_family", "jordan": "single\_family", "sam": "single\_family" }  
    }  
  \],  
  "misalignments": \[  
    {  
      "topic": "Timeline",  
      "status": "misaligned",  
      "severity": "high",  
      "summary": "Significant timeline gap: Alex wants 3 months, Sam wants 12+ months",  
      "responses": { "alex": "3mo", "jordan": "6mo", "sam": "18mo" },  
      "discussion\_prompt": "What factors are driving your timeline preferences?"  
    }  
  \],  
  "recommended\_actions": \[  
    {  
      "action": "schedule\_discussion",  
      "topic": "Timeline alignment",  
      "priority": "high"  
    }  
  \]  
}

## **6.4 Alignment Score Computation**

Overall alignment score (0-100) computed as:

* Per-question alignment: % of members with matching or compatible responses  
* Weighted by question importance (critical questions count more)  
* Averaged across all completed exercises with alignment analysis  
* Updated when new exercises completed or responses changed

# **7\. Stage Management**

While progression is non-linear within stages, the group still moves through high-level stages. Transitions are automatic based on triggers, with admin override capability.

## **7.1 Stage Transition Triggers**

| From | To | Trigger | Auto? |
| :---- | :---- | :---- | :---- |
| forming | active | 2+ active members | Yes |
| active | aligning | First group exercise started | Yes |
| aligning | designing | First TIC section opened | Yes |
| designing | qualifying | All required TIC sections complete | Yes |
| qualifying | searching | ext\_preapproval complete | Yes |
| searching | under\_contract | ext\_offer\_accepted complete | Yes |
| under\_contract | closing | Admin marks closing initiated | Manual |
| closing | managing | ext\_closing\_complete marked | Yes |
| \* | dissolved | Admin dissolves group | Manual |

## **7.2 Stage History Tracking**

Each stage transition is logged for analytics and reflection:

stage\_history: \[

  { "stage": "forming", "entered\_at": "2024-12-01T10:00:00Z", "exited\_at": "2024-12-05T14:30:00Z" },  
  { "stage": "active", "entered\_at": "2024-12-05T14:30:00Z", "exited\_at": "2024-12-10T09:15:00Z" },  
  { "stage": "aligning", "entered\_at": "2024-12-10T09:15:00Z", "exited\_at": null }  
\]

## **7.3 Admin Override**

* Admins can manually advance or revert stages  
* Override requires confirmation modal with reason field  
* All overrides logged in audit trail  
* Members notified of stage changes

# **8\. Blocker Tracking**

Blockers are issues preventing progress. They can be categorized, assigned to members, and tracked to resolution.

## **8.1 Blocker Categories**

| Category | Examples | Icon |
| :---- | :---- | :---- |
| financial | Waiting on pre-approval, need to save more for down payment | 💰 |
| alignment | Disagreement on timeline, unresolved governance discussion | 🤝 |
| external | Waiting on attorney review, agent unavailable | ⏳ |
| personal | Member traveling, life event causing delay | 👤 |
| documentation | Missing documents, waiting on records | 📄 |

## **8.2 Blocker Fields**

* **title:** Brief description (max 100 chars)  
* **category:** One of the categories above  
* **description:** Detailed explanation (optional)  
* **assigned\_to:** Member responsible (optional)  
* **status:** active, resolved  
* **created\_by:** Member who logged it

# **9\. Functional Requirements**

## **9.1 Progress Tracking**

1. System shall track individual milestone completion per member  
2. System shall compute track progress as % of required milestones complete  
3. System shall compute overall progress as weighted average of tracks  
4. System shall display progress matrix showing all members × milestones  
5. System shall update progress in real-time via Supabase subscriptions

## **9.2 Milestone Management**

1. System shall check dependencies before allowing milestone start  
2. System shall display locked milestones with missing prerequisites  
3. System shall auto-link external milestones to partner referrals  
4. System shall allow manual completion of external milestones  
5. System shall support admin override for locked milestones

## **9.3 Alignment Analysis**

1. System shall trigger analysis when all members complete individual exercise  
2. System shall send webhook to n8n for AI analysis  
3. System shall store alignment report with exercise responses  
4. System shall display alignment/misalignment summary on dashboard  
5. System shall compute and update overall alignment score  
6. System shall surface discussion prompts for misaligned topics

## **9.4 Blocker Management**

1. System shall allow any member to create blockers  
2. System shall allow blocker assignment to specific member  
3. System shall display active blockers on dashboard  
4. System shall allow marking blockers as resolved  
5. System shall notify assigned member when blocker created

## **9.5 Stage Management**

1. System shall automatically transition stages based on triggers  
2. System shall allow admin override of stage transitions  
3. System shall log stage enter/exit timestamps  
4. System shall notify members of stage changes  
5. System shall display current stage prominently on dashboard

# **10\. Data Model**

## **10.1 Milestone Definitions (public.milestone\_definitions)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| slug | VARCHAR(100) | Unique identifier (e.g., edu\_tic\_basics) |
| name | VARCHAR(255) | Display name |
| description | TEXT | Detailed description |
| track | VARCHAR(50) | education, alignment, external |
| type | VARCHAR(50) | module, exercise, agreement, external |
| scope | VARCHAR(50) | individual, group |
| is\_required | BOOLEAN | Required for journey completion |
| dependencies | JSONB | Array of prerequisite milestone slugs |
| linked\_exercise\_slug | VARCHAR(100) | FK to exercise\_templates if type=exercise |
| linked\_module\_id | UUID | FK to education modules (future) |
| auto\_link\_type | VARCHAR(50) | referral, property, manual (for external) |
| display\_order | INTEGER | Sort order within track |
| is\_active | BOOLEAN | Available to groups |

## **10.2 Milestone Progress (public.milestone\_progress)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Group reference |
| milestone\_id | UUID FK | Milestone definition reference |
| user\_id | UUID FK | Null for group milestones |
| status | VARCHAR(50) | not\_started, in\_progress, completed, locked |
| started\_at | TIMESTAMPTZ | When started |
| completed\_at | TIMESTAMPTZ | When completed |
| completed\_by | UUID FK | Who marked complete (for external) |
| linked\_entity\_type | VARCHAR(50) | exercise\_response, referral, property |
| linked\_entity\_id | UUID | FK to linked entity |
| notes | TEXT | Optional notes |

**Unique constraint:** (group\_id, milestone\_id, user\_id)

## **10.3 Alignment Reports (public.alignment\_reports)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Group reference |
| exercise\_slug | VARCHAR(100) | Exercise that triggered analysis |
| overall\_score | INTEGER | 0-100 alignment score |
| member\_responses | JSONB | Snapshot of individual responses |
| alignments | JSONB | Array of aligned topics |
| misalignments | JSONB | Array of misaligned topics with severity |
| recommended\_actions | JSONB | AI-suggested next steps |
| analyzed\_at | TIMESTAMPTZ | When analysis completed |
| version | INTEGER | Report version (re-analysis) |

## **10.4 Group Blockers (public.group\_blockers)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Group reference |
| title | VARCHAR(100) | Brief description |
| description | TEXT | Detailed description |
| category | VARCHAR(50) | financial, alignment, external, personal, documentation |
| status | VARCHAR(50) | active, resolved |
| assigned\_to | UUID FK | Member responsible |
| created\_by | UUID FK | Member who logged |
| resolved\_at | TIMESTAMPTZ | When resolved |
| resolved\_by | UUID FK | Who resolved |
| created\_at | TIMESTAMPTZ | Created timestamp |

## **10.5 Stage History (in group\_journeys.stage\_history JSONB)**

// Added to group\_journeys table

ALTER TABLE group\_journeys ADD COLUMN stage\_history JSONB DEFAULT '\[\]';

// Structure:  
\[  
  {  
    "stage": "forming",  
    "entered\_at": "2024-12-01T10:00:00Z",  
    "exited\_at": "2024-12-05T14:30:00Z",  
    "trigger": "member\_joined",  
    "override\_by": null,  
    "override\_reason": null  
  }  
\]

# **11\. n8n Webhook Integration**

## **11.1 Alignment Analysis Webhook**

Event: alignment.analysis\_requested

{  
  "event\_type": "alignment.analysis\_requested",  
  "group\_id": "abc-123",  
  "exercise\_slug": "housing\_preferences",  
  "members": \[  
    { "user\_id": "user-1", "name": "Alex", "responses": {...} },  
    { "user\_id": "user-2", "name": "Jordan", "responses": {...} },  
    { "user\_id": "user-3", "name": "Sam", "responses": {...} }  
  \],  
  "exercise\_schema": {...},  
  "callback\_url": "https://api.tomi.app/webhooks/alignment-result"  
}

## **11.2 n8n Workflow: AI Analysis**

* **Trigger:** Webhook receives alignment.analysis\_requested  
* **Step 1:** Format prompt with member responses and exercise schema  
* **Step 2:** Call Claude API for analysis  
* **Step 3:** Parse response into AlignmentReport structure  
* **Step 4:** POST result to callback\_url  
* **Step 5:** Optionally notify group members

## **11.3 Other Events**

| Event | Trigger | Action |
| :---- | :---- | :---- |
| stage.transitioned | Stage changes | Notify members |
| blocker.created | New blocker logged | Notify assigned member |
| milestone.completed | Milestone marked complete | Check stage triggers |
| alignment.report\_ready | Analysis complete | Update dashboard, notify |

# **12\. API Endpoints**

## **12.1 Journey & Progress**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/journey | Get journey state, stage, scores |
| GET | /api/groups/:id/progress | Get progress across all tracks |
| GET | /api/groups/:id/progress/matrix | Get member × milestone matrix |
| PATCH | /api/groups/:id/journey/stage | Admin override stage (with reason) |
| PATCH | /api/groups/:id/journey/target-date | Set target close date |

## **12.2 Milestones**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/milestones | List all milestones with status |
| GET | /api/groups/:id/milestones/:slug | Get milestone details and progress |
| POST | /api/groups/:id/milestones/:slug/start | Start milestone (checks dependencies) |
| POST | /api/groups/:id/milestones/:slug/complete | Mark external milestone complete |
| POST | /api/groups/:id/milestones/:slug/override | Admin unlock locked milestone |

## **12.3 Alignment**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/alignment | Get overall alignment score and summary |
| GET | /api/groups/:id/alignment/reports | List all alignment reports |
| GET | /api/groups/:id/alignment/reports/:exerciseSlug | Get specific alignment report |
| POST | /api/groups/:id/alignment/reanalyze/:exerciseSlug | Trigger re-analysis |

## **12.4 Blockers**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/blockers | List blockers (filter: active/resolved) |
| POST | /api/groups/:id/blockers | Create blocker |
| PATCH | /api/groups/:id/blockers/:blockerId | Update blocker (assign, edit) |
| POST | /api/groups/:id/blockers/:blockerId/resolve | Mark resolved |

# **13\. UI/UX Requirements**

## **13.1 Journey Dashboard**

* **Header:** Stage badge, alignment score gauge, target close date  
* **Track cards:** Three cards showing track progress bars  
* **Recommended actions:** AI-suggested next steps (max 3\)  
* **Active blockers:** List of unresolved blockers  
* **Alignment alerts:** High-severity misalignments needing discussion

## **13.2 Progress Matrix View**

* **Layout:** Table with milestones as rows, members as columns  
* **Cell content:** Status icon (✓, ◐, ○, 🔒)  
* **Row grouping:** Collapsible sections by track  
* **Click action:** Open milestone detail or start exercise  
* **Filter:** Show all / required only / incomplete only

## **13.3 Alignment Report View**

* **Score display:** Circular gauge with percentage  
* **Aligned topics:** Green cards with summary  
* **Misaligned topics:** Red/orange cards with severity indicator  
* **Detail expansion:** Click to see individual responses  
* **Discussion CTA:** 'Discuss This' button links to group chat

# **14\. Out of Scope (MVP)**

* Projected timeline/Gantt chart — target date only  
* Education module content — defined in future PRD  
* Custom milestone creation by users  
* Blocker due dates and priorities — category \+ assignment only  
* Automated blocker suggestions from AI

# **15\. Open Questions**

1. Should alignment re-analysis be automatic when responses change, or manual?  
2. How to handle partial group completion (e.g., 2 of 3 members done)?  
3. Should we show estimated time remaining per milestone?

# **16\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| Dashboard displays three progress tracks | Manual test | Pass |
| Progress matrix shows all members × milestones | Manual test | Pass |
| Dependencies block locked milestones | Manual test | Pass |
| Alignment analysis triggers on last completion | E2E test | \<60s |
| Alignment report displays correctly | Manual test | Pass |
| Stage auto-transitions on triggers | Integration test | Pass |
| Admin can override stage | Manual test | Pass |
| Blockers can be created, assigned, resolved | Manual test | Pass |
| External milestones link to referrals | Manual test | Pass |
| Stage history logged correctly | DB query | Pass |
| Dashboard loads in under 2 seconds | Performance test | \<2s |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

