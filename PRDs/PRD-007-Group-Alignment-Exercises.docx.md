# **PRD-007: Group Alignment Exercises**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 1 — Group Formation |
| **Dependencies** | PRD-003 (Exercise Framework), PRD-005 (Groups), PRD-006 (Journey) |

# **1\. Overview**

This PRD defines the group alignment exercise system — a structured process where individuals complete exercises independently, AI analyzes collective responses to identify alignment and misalignment, and the group discusses and resolves differences. This system transforms individual preferences into collective decisions that inform the TIC agreement.

## **1.1 Purpose**

Surface potential conflicts before they become problems. By having each member answer the same questions independently (before seeing others' responses), we capture authentic preferences. AI analysis then highlights where the group agrees, partially agrees, or significantly disagrees — providing a structured foundation for productive discussions.

## **1.2 The Alignment Lifecycle**

Four Phases:

┌─────────────────────────────────────────────────────────────────────┐  
│                    GROUP ALIGNMENT LIFECYCLE                        │  
├─────────────────────────────────────────────────────────────────────┤  
│                                                                     │  
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │  
│  │   PHASE 1    │    │   PHASE 2    │    │   PHASE 3    │          │  
│  │  Individual  │───▶│  AI Analysis │───▶│  Discussion  │          │  
│  │  Completion  │    │              │    │              │          │  
│  └──────────────┘    └──────────────┘    └──────────────┘          │  
│        │                   │                   │                   │  
│        ▼                   ▼                   ▼                   │  
│  Each member         Compare all         Review report,           │  
│  answers solo,       responses,          discuss gaps,            │  
│  blind to others     surface gaps        find common ground       │  
│                                                                     │  
│                                          ┌──────────────┐          │  
│                                          │   PHASE 4    │          │  
│                                     ────▶│  Resolution  │          │  
│                                          │              │          │  
│                                          └──────────────┘          │  
│                                                │                   │  
│                                                ▼                   │  
│                                          Record decisions,        │  
│                                          feed to TIC builder      │  
│                                                                     │  
└─────────────────────────────────────────────────────────────────────┘

## **1.3 Exercise Categories**

| Category | Description | Alignment Role |
| :---- | :---- | :---- |
| individual | Personal readiness and preferences | Feeds into group alignment analysis when all complete |
| group | Group-level decisions and agreements | Direct group input, collective outcome |
| hybrid | Individual input → Group discussion → Decision | Full alignment lifecycle |

*This PRD focuses on hybrid exercises — the full alignment lifecycle. Individual exercises (PRD-003) and pure group exercises follow simpler flows.*

## **1.4 Success Criteria**

* All members complete individual phase before seeing others' responses  
* AI analysis completes within 60 seconds of last submission  
* Alignment report correctly identifies matches and mismatches  
* Re-submission triggers automatic re-analysis  
* 80% of groups report alignment exercises helped surface important discussions  
* Laggards receive nudge notifications at 48h and 5 days

# **2\. User Stories**

## **2.1 Individual Phase**

* **US-1:** As a group member, I want to complete alignment exercises privately so my answers aren't influenced by others.  
* **US-2:** As a group member, I want to see who has and hasn't completed so I know when analysis will be ready.  
* **US-3:** As a group member who hasn't completed, I want to receive reminders so the group isn't waiting on me.

## **2.2 Analysis Phase**

* **US-4:** As a group member, I want to see where we align so I know what's already agreed.  
* **US-5:** As a group member, I want to see where we disagree so I know what needs discussion.  
* **US-6:** As a group member, I want severity indicators so I can prioritize the biggest gaps.

## **2.3 Discussion Phase**

* **US-7:** As a group, we want discussion prompts so we have a starting point for tough conversations.  
* **US-8:** As a group, we want to see each person's original response during discussion for context.  
* **US-9:** As a group admin, I want to schedule a discussion session so we have dedicated time to resolve differences.

## **2.4 Resolution Phase**

* **US-10:** As a group, we want to record our agreed decision so it's captured for the TIC agreement.  
* **US-11:** As a group member, I want to update my response after discussion if my position changed.  
* **US-12:** As a group, we want the alignment score to update after resolution so we can track improvement.

# **3\. Group Alignment Exercises (MVP)**

The following exercises use the hybrid model: individual completion → AI analysis → group discussion → resolution. Each exercise maps to one or more TIC agreement sections.

## **3.1 Exercise: Shared Vision & Timeline**

| Attribute | Value |
| :---- | :---- |
| slug | grp\_shared\_vision |
| estimated\_time | 8 minutes |
| tic\_sections | Purpose, Timeline, Goals |
| dependencies | None |

**Questions:**

| \# | Question | Type | Alignment Focus |
| :---- | :---- | :---- | :---- |
| 1 | Why do you want to co-own a home? (select all) | multi\_select | Motivation match |
| 2 | What's your ideal purchase timeline? | single\_select | Timeline sync |
| 3 | How long do you expect to own this property? | single\_select | Commitment horizon |
| 4 | What's your primary goal for this investment? | ranking | Priority alignment |
| 5 | How flexible is your timeline if the right property takes longer? | slider | Flexibility match |
| 6 | What would make this co-ownership unsuccessful for you? | textarea | Risk awareness |

## **3.2 Exercise: Property Criteria**

| Attribute | Value |
| :---- | :---- |
| slug | grp\_property\_criteria |
| estimated\_time | 10 minutes |
| tic\_sections | Property Description, Use Restrictions |
| dependencies | All members: ind\_housing\_preferences |

**Questions:**

| \# | Question | Type | Alignment Focus |
| :---- | :---- | :---- | :---- |
| 1 | Which metro areas are you targeting? (select up to 3\) | location | Geographic match |
| 2 | Rank property types by preference | ranking | Type preference |
| 3 | What's your acceptable price range? | range\_slider | Budget overlap |
| 4 | Minimum bedrooms required? | number | Size requirements |
| 5 | Which features are must-haves? (select all) | multi\_select | Feature alignment |
| 6 | Which features are deal-breakers? (select all) | multi\_select | Veto alignment |
| 7 | Rank neighborhood priorities | ranking | Lifestyle match |
| 8 | How important is resale value vs. personal enjoyment? | slider | Investment philosophy |

## **3.3 Exercise: Financial Contribution**

| Attribute | Value |
| :---- | :---- |
| slug | grp\_financial\_contribution |
| estimated\_time | 12 minutes |
| tic\_sections | Ownership Percentages, Capital Contributions, Ongoing Expenses |
| dependencies | All members: ind\_financial\_readiness |

**Questions:**

| \# | Question | Type | Alignment Focus |
| :---- | :---- | :---- | :---- |
| 1 | How much can you contribute to down payment? | currency | Capital capacity |
| 2 | What monthly payment can you comfortably afford? | currency | Cash flow capacity |
| 3 | Should ownership % match financial contribution? | single\_select | Equity philosophy |
| 4 | How should unexpected major repairs be funded? | single\_select | Reserve strategy |
| 5 | How much emergency reserve should the group maintain? | currency | Risk tolerance |
| 6 | If someone can't make a payment, what should happen? | single\_select | Default handling |
| 7 | Should members be able to invest additional capital later? | single\_select | Future flexibility |

## **3.4 Exercise: Governance Model**

| Attribute | Value |
| :---- | :---- |
| slug | grp\_governance\_model |
| estimated\_time | 10 minutes |
| tic\_sections | Decision Making, Voting Rights, Meetings |
| dependencies | None |

**Questions:**

| \# | Question | Type | Alignment Focus |
| :---- | :---- | :---- | :---- |
| 1 | How should major decisions be made? | single\_select | Decision model |
| 2 | Should voting power be equal or proportional to ownership? | single\_select | Power structure |
| 3 | What decisions require unanimous consent? (select all) | multi\_select | Veto rights |
| 4 | How often should the group formally meet? | single\_select | Communication cadence |
| 5 | How should day-to-day decisions be handled? | single\_select | Operational efficiency |
| 6 | What happens if someone consistently misses meetings? | single\_select | Accountability |

## **3.5 Exercise: Space Allocation**

| Attribute | Value |
| :---- | :---- |
| slug | grp\_space\_allocation |
| estimated\_time | 8 minutes |
| tic\_sections | Exclusive Use Areas, Common Areas, Modifications |
| dependencies | grp\_property\_criteria |

**Questions:**

| \# | Question | Type | Alignment Focus |
| :---- | :---- | :---- | :---- |
| 1 | Will you live in the property or use it as investment? | single\_select | Use intent |
| 2 | If living there, which spaces should be exclusive vs shared? | multi\_select | Space division |
| 3 | How should exclusive spaces be allocated? | single\_select | Allocation method |
| 4 | Can members modify their exclusive spaces freely? | single\_select | Autonomy level |
| 5 | How should shared space scheduling work? | single\_select | Coordination style |
| 6 | Are pets allowed? If so, what restrictions? | single\_select | Lifestyle rules |
| 7 | Can members have guests stay overnight? For how long? | single\_select | Guest policy |

## **3.6 Exercise: Exit & Buyout**

| Attribute | Value |
| :---- | :---- |
| slug | grp\_exit\_buyout |
| estimated\_time | 10 minutes |
| tic\_sections | Transfer Rights, ROFR, Buyout Process, Dispute Resolution |
| dependencies | edu\_exit\_strategies |

**Questions:**

| \# | Question | Type | Alignment Focus |
| :---- | :---- | :---- | :---- |
| 1 | Should existing members have first right to buy out a leaving member? | single\_select | ROFR preference |
| 2 | How should the buyout price be determined? | single\_select | Valuation method |
| 3 | What's the minimum notice period for wanting to sell? | single\_select | Notice requirements |
| 4 | Should there be a penalty for early exit? | single\_select | Exit friction |
| 5 | How should disputes be resolved? | single\_select | Conflict resolution |
| 6 | What happens if the group can't agree on a major decision? | single\_select | Deadlock breaking |
| 7 | Under what circumstances could a member be forced out? | multi\_select | Removal grounds |

# **4\. Alignment Analysis System**

The AI analysis system compares individual responses to surface alignment patterns. Different question types require different comparison strategies.

## **4.1 Comparison Strategies by Question Type**

| Type | Alignment Detection | Severity Calculation |
| :---- | :---- | :---- |
| single\_select | Exact match \= aligned; all different \= misaligned | High if options are mutually exclusive |
| multi\_select | Jaccard similarity on selected options | Based on overlap percentage |
| number | Range overlap and mean deviation | Based on % difference from mean |
| currency | Range overlap with tolerance band | High if ranges don't overlap |
| slider | Standard deviation of values | Based on spread |
| range\_slider | Intersection of all ranges | High if no valid intersection |
| ranking | Kendall tau correlation | Based on rank inversions |
| location | Overlapping regions/metros | High if no geographic overlap |
| textarea | Semantic similarity via embeddings | AI judges conceptual alignment |

## **4.2 Alignment Categories**

| Category | Score | Definition | UI Treatment |
| :---- | :---- | :---- | :---- |
| Strong Alignment | 80-100 | All members match or highly compatible | Green, collapsed |
| Moderate Alignment | 60-79 | Majority aligned with minor differences | Yellow, note |
| Weak Alignment | 40-59 | Split opinions, discussion recommended | Orange, expanded |
| Misalignment | 0-39 | Significant disagreement, requires resolution | Red, priority flag |

## **4.3 AI Analysis Prompt Structure**

The n8n workflow sends this context to Claude for analysis:

\<system\_prompt\>

You are analyzing responses from co-buying group members to identify  
alignment and misalignment. Your goal is to:

1\. Identify where members agree (alignments)  
2\. Identify where members disagree (misalignments) with severity  
3\. Generate discussion prompts for misaligned topics  
4\. Recommend actions to resolve differences

Be specific about WHO disagrees with WHOM and WHY.  
Focus on actionable insights, not generic observations.  
\</system\_prompt\>

\<user\_prompt\>  
Exercise: {exercise\_name}  
Group: {group\_name} ({member\_count} members)

Member Responses:  
{for each member}  
  {member\_name}:  
    Q1: {response}  
    Q2: {response}  
    ...  
{end for}

Question Schemas:  
{question definitions with options}

Analyze alignment and return structured JSON.  
\</user\_prompt\>

## **4.4 Re-Analysis Trigger**

When a member updates their exercise responses after initial analysis:

* System detects response change via updated\_at timestamp  
* Automatic re-analysis triggered within 30 seconds  
* New alignment report generated with incremented version  
* Previous report archived for comparison  
* Group notified of updated alignment scores  
* Dashboard shows 'Updated' badge on report

# **5\. Progress Nudging**

When group members haven't completed their individual phase, the system nudges them to prevent bottlenecks.

## **5.1 Nudge Schedule**

| Trigger | Timing | Message | Channel |
| :---- | :---- | :---- | :---- |
| Soft nudge | 48 hours after exercise started by any member | "{group\_name} is waiting on your responses to {exercise}. Complete it to unlock alignment insights." | In-app, push |
| Firm nudge | 5 days after exercise started | "Your co-buyers have completed {exercise}. Finish yours so the group can review alignment." | SMS, email |
| Escalation | 10 days (if configured) | "The group is blocked waiting for your input on {exercise}." | SMS, email |

## **5.2 Nudge Logic**

* Nudges only sent to members who haven't completed  
* Max one nudge per member per 48-hour window  
* User can snooze nudges (1 week max)  
* Admin can manually trigger nudge for specific member  
* Nudges stop when member completes or leaves group

# **6\. Discussion Facilitation**

After alignment analysis, the system facilitates group discussion on misaligned topics.

## **6.1 Discussion Prompts**

AI generates contextual discussion prompts for each misaligned topic:

| Topic Pattern | Example Prompt |
| :---- | :---- |
| Timeline gap | "Alex wants to buy in 3 months while Sam prefers 12+. What factors are driving your timelines? Is there flexibility?" |
| Budget range | "Your budget ranges don't fully overlap. The intersection is $X-$Y. Is this workable for everyone?" |
| Decision model | "Jordan prefers unanimous consent while others prefer majority vote. What decisions feel most important to protect with veto rights?" |
| Exit terms | "There's disagreement on early exit penalties. What's driving the concern about flexibility vs. commitment?" |

## **6.2 Discussion View UI**

* **Topic cards:** One card per misaligned topic, ordered by severity  
* **Response comparison:** Side-by-side view of each member's answer  
* **Discussion prompt:** AI-generated conversation starter  
* **Chat link:** 'Discuss in chat' button opens group chat with topic pre-filled  
* **Resolution button:** 'Mark as resolved' with outcome selection

# **7\. Resolution & TIC Integration**

Resolved alignment topics feed directly into TIC agreement sections, reducing redundant data entry and ensuring consistency.

## **7.1 Resolution Options**

| Resolution Type | Description | Score Impact |
| :---- | :---- | :---- |
| consensus | Group agrees on single position | Topic → 100 |
| compromise | Middle-ground position selected | Topic → 80 |
| defer | Decision postponed, not blocking | No change |
| accept\_difference | Acknowledge difference, no action needed | Topic → 70 |

## **7.2 TIC Section Mapping**

| Exercise | Question Topics | TIC Section |
| :---- | :---- | :---- |
| grp\_shared\_vision | Timeline, ownership duration | Article 1: Purpose & Term |
| grp\_property\_criteria | Property requirements, use intent | Article 2: Property & Use |
| grp\_financial\_contribution | Contributions, reserves, defaults | Article 3: Financial Terms |
| grp\_governance\_model | Voting, meetings, decisions | Article 4: Governance |
| grp\_space\_allocation | Exclusive/shared spaces, rules | Article 5: Use & Occupancy |
| grp\_exit\_buyout | ROFR, valuation, disputes | Article 6: Transfer & Exit |

## **7.3 Data Flow to TIC Builder**

// When resolution recorded

{  
  "exercise\_slug": "grp\_financial\_contribution",  
  "topic": "ownership\_percentage\_method",  
  "resolution": {  
    "type": "consensus",  
    "value": "proportional\_to\_contribution",  
    "resolved\_by": \["user-1", "user-2", "user-3"\],  
    "resolved\_at": "2024-12-15T14:00:00Z"  
  },  
  "tic\_mapping": {  
    "section": "article\_3\_financial\_terms",  
    "field": "ownership\_allocation\_method",  
    "suggested\_text": "Ownership percentages shall be allocated in proportion to each Co-Owner's capital contribution..."  
  }  
}

# **8\. Functional Requirements**

## **8.1 Individual Phase**

1. System shall hide other members' responses until all complete  
2. System shall show completion status of all members  
3. System shall track time since exercise started  
4. System shall send nudge notifications per schedule  
5. System shall prevent response viewing until own submission complete

## **8.2 Analysis Phase**

1. System shall trigger analysis when last member completes  
2. System shall complete analysis within 60 seconds  
3. System shall generate alignment score per topic and overall  
4. System shall categorize topics by alignment level  
5. System shall generate discussion prompts for misaligned topics  
6. System shall notify all members when analysis ready

## **8.3 Discussion Phase**

1. System shall display alignment report with topic cards  
2. System shall show side-by-side response comparison  
3. System shall provide AI-generated discussion prompts  
4. System shall link to group chat for each topic  
5. System shall track which topics have been discussed

## **8.4 Resolution Phase**

1. System shall allow marking topics as resolved with type  
2. System shall record resolution value and participants  
3. System shall update alignment score after resolution  
4. System shall map resolutions to TIC sections  
5. System shall pre-fill TIC builder with resolved values

## **8.5 Re-submission**

1. System shall allow members to update responses after initial submission  
2. System shall automatically trigger re-analysis on update  
3. System shall version alignment reports  
4. System shall show diff between report versions  
5. System shall notify group of score changes

# **9\. Data Model Additions**

## **9.1 Group Exercise State (public.group\_exercise\_state)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Group reference |
| exercise\_slug | VARCHAR(100) | Exercise identifier |
| phase | VARCHAR(50) | individual, analyzing, discussion, resolved |
| started\_at | TIMESTAMPTZ | When first member started |
| analysis\_completed\_at | TIMESTAMPTZ | When AI analysis finished |
| resolved\_at | TIMESTAMPTZ | When all topics resolved |
| last\_nudge\_sent\_at | TIMESTAMPTZ | For nudge throttling |
| current\_report\_id | UUID FK | Latest alignment report |

## **9.2 Topic Resolutions (public.topic\_resolutions)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Group reference |
| report\_id | UUID FK | Alignment report reference |
| topic\_key | VARCHAR(100) | Topic identifier from report |
| resolution\_type | VARCHAR(50) | consensus, compromise, defer, accept\_difference |
| resolution\_value | JSONB | Agreed value/position |
| resolved\_by | UUID\[\] | Members who confirmed |
| notes | TEXT | Optional notes on decision |
| tic\_section | VARCHAR(100) | Mapped TIC section |
| tic\_field | VARCHAR(100) | Mapped TIC field |
| created\_at | TIMESTAMPTZ | Resolution timestamp |

## **9.3 Nudge Log (public.nudge\_log)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| user\_id | UUID FK | Nudged user |
| group\_id | UUID FK | Group reference |
| exercise\_slug | VARCHAR(100) | Exercise identifier |
| nudge\_type | VARCHAR(50) | soft, firm, escalation |
| channel | VARCHAR(50) | in\_app, push, sms, email |
| sent\_at | TIMESTAMPTZ | When sent |
| snoozed\_until | TIMESTAMPTZ | If user snoozed |

# **10\. API Endpoints**

## **10.1 Group Exercises**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/exercises | List group exercises with state |
| GET | /api/groups/:id/exercises/:slug | Get exercise details, schema, member status |
| GET | /api/groups/:id/exercises/:slug/my-response | Get current user's response |
| POST | /api/groups/:id/exercises/:slug/submit | Submit/update individual response |
| GET | /api/groups/:id/exercises/:slug/responses | Get all responses (after analysis) |

## **10.2 Alignment**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/exercises/:slug/alignment | Get alignment report for exercise |
| GET | /api/groups/:id/exercises/:slug/alignment/history | Get all report versions |
| POST | /api/groups/:id/exercises/:slug/alignment/reanalyze | Force re-analysis |

## **10.3 Resolution**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/exercises/:slug/resolutions | Get topic resolutions |
| POST | /api/groups/:id/exercises/:slug/resolutions | Record topic resolution |
| PATCH | /api/groups/:id/resolutions/:resolutionId | Update resolution |

## **10.4 Nudging**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/groups/:id/exercises/:slug/nudge/:userId | Admin sends manual nudge |
| POST | /api/nudges/:nudgeId/snooze | User snoozes nudge |

# **11\. n8n Workflow Integration**

## **11.1 Alignment Analysis Workflow**

* **Trigger:** Webhook from app when last member submits  
* **Step 1:** Fetch all member responses from database  
* **Step 2:** Format prompt with responses and exercise schema  
* **Step 3:** Call Claude API with analysis prompt  
* **Step 4:** Parse JSON response into AlignmentReport  
* **Step 5:** Save report to alignment\_reports table  
* **Step 6:** Update group\_exercise\_state phase  
* **Step 7:** Send notification to all members

## **11.2 Nudge Scheduler Workflow**

* **Trigger:** Cron every 6 hours  
* **Step 1:** Query exercises in 'individual' phase  
* **Step 2:** For each, find members who haven't completed  
* **Step 3:** Check time since started and last nudge  
* **Step 4:** Send appropriate nudge type per schedule  
* **Step 5:** Log nudge to nudge\_log

## **11.3 Re-Analysis Workflow**

* **Trigger:** Webhook when response updated after initial analysis  
* **Step 1-4:** Same as analysis workflow  
* **Step 5:** Increment report version  
* **Step 6:** Compare scores to previous version  
* **Step 7:** Notify group with score delta

# **12\. UI/UX Requirements**

## **12.1 Exercise Landing Page**

* **Header:** Exercise name, estimated time, purpose  
* **Member status:** Avatar row with checkmarks for completed  
* **Phase indicator:** Visual stepper showing current phase  
* **CTA:** 'Start Exercise' / 'View Report' / 'Continue Discussion'  
* **TIC connection:** "This informs your TIC agreement sections: X, Y, Z"

## **12.2 Individual Completion View**

* **Privacy notice:** "Your answers are private until everyone completes"  
* **Progress:** Question counter and progress bar  
* **Waiting state:** After completion, show who's still working  
* **Analysis pending:** Loading state while AI analyzes

## **12.3 Alignment Report View**

* **Overall score:** Large circular gauge with percentage  
* **Topic list:** Expandable cards grouped by alignment level  
* **Topic card expanded:** Response comparison, discussion prompt, resolve button  
* **Version indicator:** "v2 \- Updated 2 hours ago" with view history link  
* **Edit option:** 'Update my responses' link for each member

## **12.4 Resolution Modal**

* **Topic summary:** What the disagreement was about  
* **Resolution type:** Radio buttons for consensus/compromise/defer/accept  
* **Value input:** What the group decided (free text or structured)  
* **Notes:** Optional context on the decision  
* **Confirmation:** Requires at least 2 members to confirm

# **13\. Out of Scope (MVP)**

* Partial analysis (when subset of members complete)  
* Voice/video discussion integration  
* Anonymous response mode  
* Custom group exercises (admin-created)  
* Mediation escalation to external party  
* Alignment trend analysis over time

# **14\. Open Questions**

1. Should we show partial alignment (e.g., "2 of 3 members agree") before all complete?  
2. How many members need to confirm a resolution? (Lean: majority)  
3. Should groups be able to skip exercises they deem not applicable?

# **15\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| Member cannot see others' responses before completing | Security test | Pass |
| Analysis triggers when last member submits | E2E test | Pass |
| Analysis completes within 60 seconds | Performance test | \<60s |
| Alignment report shows correct categories | Manual test | Pass |
| Discussion prompts generated for misaligned topics | Manual test | Pass |
| Re-submission triggers automatic re-analysis | E2E test | Pass |
| Nudge sent at 48 hours to incomplete members | E2E test | Pass |
| Resolution records correctly | DB query | Pass |
| Resolution maps to TIC section | Manual test | Pass |
| Score updates after resolution | Manual test | Pass |
| Report version increments on re-analysis | DB query | Pass |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

