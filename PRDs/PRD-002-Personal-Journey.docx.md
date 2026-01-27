# **PRD-002: Personal Journey Initialization**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 0 — Foundation |
| **Dependencies** | PRD-001 (Authentication) |

# **1\. Overview**

This PRD defines the personal journey system that guides individual users from initial exploration through co-buying readiness. It captures user goals, preferences, and financial preparedness through structured exercises, creating the foundation for group formation and AI agent personalization.

## **1.1 Purpose**

Enable users to self-assess their readiness for co-ownership, articulate their goals and preferences, and receive personalized guidance. This data powers the personal AI agent, informs group matching (future), and ensures users enter groups with clear expectations.

## **1.2 User Journey Context**

The personal journey exists independent of group membership. A user may:

* Complete exercises solo before finding co-buyers  
* Join a group immediately and complete exercises in parallel  
* Revisit and update responses as circumstances change  
* Participate in multiple groups with the same personal profile

## **1.3 Journey Stages**

| Stage | Description | Transition Trigger |
| :---- | :---- | :---- |
| exploring | Learning about co-ownership, no concrete plans | Account creation (default) |
| educating | Actively learning, consuming content | Completes first exercise |
| preparing | Assessing readiness, defining preferences | Completes readiness exercise |
| ready | Prepared to join or form a group | Readiness score ≥ 70 |
| in\_group | Active member of one or more groups | Joins/creates first group |
| owner | Has closed on a property | Group reaches 'managing' stage |

## **1.4 Success Criteria**

* 70% of users complete at least one exercise within 7 days of registration  
* 50% of users reach 'ready' stage within 30 days  
* Exercise completion rate exceeds 80% once started  
* User-reported relevance score ≥ 4/5 for exercise content

# **2\. User Stories**

1.  **Journey Start:** As a new user, I want to understand my path to co-ownership so that I know what steps to take.  
2.  **Financial Assessment:** As a prospective co-buyer, I want to assess my financial readiness so that I know if I'm prepared to move forward.  
3.  **Preference Capture:** As a prospective co-buyer, I want to articulate my housing preferences so that I can identify compatible co-buyers and clearly communicate my intentions.  
4.  **Timeline Setting:** As a prospective co-buyer, I want to specify my target timeline so that I can be matched with others on similar schedules.  
5.  **Progress Tracking:** As a user, I want to see my journey progress so that I feel a sense of accomplishment and know what's next.  
6.  **Exercise Revision:** As a user, I want to update my exercise responses so that my profile reflects my current situation.  
7.  **Readiness Score:** As a user, I want to see my readiness score so that I understand how prepared I am.

# **3\. Functional Requirements**

## **3.1 Journey Initialization**

1. System shall create user\_journey record upon account creation  
2. System shall set initial stage to 'exploring'  
3. System shall present welcome flow with journey overview  
4. System shall collect initial context: timeline intent, co-buyer status  
5. System shall allow users to skip initial context and complete later

6. System shall prompt user to invite potential co-buyers to start a group ‘buying party’

## **3.2 Exercise Framework**

1. System shall display available exercises based on journey stage  
2. System shall render exercises from JSON schema definitions  
3. System shall support question types: single-select, multi-select, slider, number input, text input, ranking  
4. System shall auto-save progress as user completes each question  
5. System shall compute scores based on exercise-specific scoring rules  
6. System shall allow users to retake exercises (versioned responses)  
7. System shall estimate completion time for each exercise

## **3.3 Progress & Stage Transitions**

1. System shall automatically transition stages based on defined triggers  
2. System shall compute overall readiness score from weighted exercise scores  
3. System shall display progress dashboard with completed/remaining exercises  
4. System shall notify users when they reach new stages  
5. System shall surface recommended next actions based on current stage

## **3.4 Personal Agent Context (Preview)**

*Note: Full personal agent implementation is PRD-013. This section defines data capture for agent context.*

1. System shall structure exercise responses for agent consumption  
2. System shall expose user preferences, goals, and readiness to agent context  
3. System shall update agent context when exercise responses change

# **4\. Exercise Definitions**

MVP includes four core exercises. Additional exercises can be added via the exercise\_templates table without code changes.

## **4.1 Financial Readiness Assessment**

| Attribute | Value |
| :---- | :---- |
| Slug | financial\_readiness |
| Category | individual |
| Stage | exploring, educating, preparing |
| Est. Time | 5 minutes |
| Required | Yes (for 'ready' stage) |

**Questions:**

* Savings available for down payment (number input)  
* Comfortable monthly housing budget (number input)  
* Estimated debt-to-income ratio (single-select: \<30%, 30-40%, \>40%)  
* Credit score range (single-select: \<620, 620-679, 680-739, 740+)  
* Employment stability (single-select: \<1yr, 1-2yr, 2-5yr, 5+yr)  
* Pre-approval status (single-select: not started, in progress, approved)

## **4.2 Housing Preferences**

| Attribute | Value |
| :---- | :---- |
| Slug | housing\_preferences |
| Category | individual |
| Stage | educating, preparing |
| Est. Time | 8 minutes |
| Required | Yes (for 'ready' stage) |

**Questions:**

* Target metro areas (multi-select with search)  
* Property type preference (ranking: single-family, condo, townhouse, multi-family)  
* Minimum bedrooms needed (number input)  
* Must-have features (multi-select: parking, yard, home office, in-unit laundry, etc.)  
* Deal-breakers (multi-select: HOA, shared walls, no pets, etc.)  
* Neighborhood priorities (ranking: walkability, schools, nightlife, transit, safety)

## **4.3 Lifestyle & Living Arrangement**

| Attribute | Value |
| :---- | :---- |
| Slug | lifestyle\_arrangement |
| Category | individual (hybrid in group context) |
| Stage | preparing |
| Est. Time | 6 minutes |
| Required | Recommended |

**Questions:**

* Occupancy intent (single-select: primary residence, part-time, investment)  
* Household composition (multi-select: just me, partner, children, pets)  
* Desired usage (TACO, SACO, Investment-only)  
* Work situation (single-select: remote, hybrid, in-office, varies)  
* Noise tolerance (slider: quiet to lively)  
* Guest frequency (single-select: rarely, monthly, weekly, often)  
* Revenue intent (open to renting y/n?)  
* Shared space comfort (slider: private to communal)

## **4.4 Timeline & Commitment**

| Attribute | Value |
| :---- | :---- |
| Slug | timeline\_commitment |
| Category | individual |
| Stage | exploring, educating, preparing |
| Est. Time | 4 minutes |
| Required | Yes |

**Questions:**

* Target purchase timeline (single-select: 3mo, 6mo, 12mo, 18mo+, exploring)  
* Ownership duration intent (single-select: 2-3yr, 3-5yr, 5-10yr, 10+yr, unsure)  
* Co-buyer status (single-select: have co-buyers, seeking, open to either)  
* Flexibility on timeline (slider: fixed to flexible)  
* Current housing situation (single-select: renting, with family, own, other)

# **5\. Data Model**

## **5.1 User Journeys (public.user\_journeys)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| user\_id | UUID FK | References users.id, unique |
| stage | VARCHAR(50) | Current journey stage |
| readiness\_score | INTEGER | Computed 0-100 score |
| target\_timeline | VARCHAR(50) | 3mo, 6mo, 12mo, 18mo+, exploring |
| target\_markets | JSONB | Array of metro area codes |
| budget\_range\_low | INTEGER | Minimum purchase price |
| budget\_range\_high | INTEGER | Maximum purchase price |
| co\_buyer\_status | VARCHAR(50) | has\_cobuyers, seeking, open |
| created\_at | TIMESTAMPTZ | Journey start |
| updated\_at | TIMESTAMPTZ | Last update |

## **5.2 Exercise Templates (public.exercise\_templates)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| slug | VARCHAR(100) | Unique identifier |
| name | VARCHAR(255) | Display name |
| description | TEXT | Exercise overview |
| category | VARCHAR(50) | individual, group, hybrid |
| journey\_stages | JSONB | Array of applicable stages |
| schema | JSONB | JSON Schema for questions |
| scoring\_rules | JSONB | Score computation rules |
| display\_order | INTEGER | Sort order in UI |
| is\_required | BOOLEAN | Required for stage transition |
| estimated\_minutes | INTEGER | Completion time estimate |
| is\_active | BOOLEAN | Available to users |
| created\_at | TIMESTAMPTZ | Created timestamp |

## **5.3 User Exercise Responses (public.user\_exercise\_responses)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| user\_id | UUID FK | References users.id |
| exercise\_id | UUID FK | References exercise\_templates.id |
| group\_id | UUID FK | Nullable, for hybrid exercises in group context |
| responses | JSONB | Question responses per schema |
| computed\_scores | JSONB | Derived metrics |
| status | VARCHAR(50) | in\_progress, completed |
| started\_at | TIMESTAMPTZ | When user began |
| completed\_at | TIMESTAMPTZ | When user finished |
| version | INTEGER | Response version (retakes) |

# **6\. Scoring System**

## **6.1 Financial Readiness Score (0-100)**

| Factor | Weight | Max Points |
| :---- | :---- | :---- |
| Credit score range | 25% | 25 |
| Debt-to-income ratio | 25% | 25 |
| Down payment savings vs. target | 20% | 20 |
| Employment stability | 15% | 15 |
| Pre-approval status | 15% | 15 |

## **6.2 Overall Readiness Score**

Weighted average of completed exercise scores:

* Financial Readiness: 40%  
* Housing Preferences: 20% (completeness)  
* Lifestyle Arrangement: 20% (completeness)  
* Timeline Commitment: 20% (clarity \+ flexibility)

## **6.3 Readiness Thresholds**

| Score Range | Label | Messaging |
| :---- | :---- | :---- |
| 0-39 | Exploring | Keep learning\! Complete exercises to assess readiness. |
| 40-59 | Preparing | Making progress. Address highlighted areas to improve. |
| 60-79 | Nearly Ready | Almost there\! Consider starting to form a group. |
| 80-100 | Ready | You're prepared for co-ownership. Time to find co-buyers\! |

# **7\. API Endpoints**

## **7.1 Journey**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/journey | Get current user's journey state |
| PATCH | /api/journey | Update journey fields (timeline, markets, etc.) |
| GET | /api/journey/progress | Get progress summary with next actions |

## **7.2 Exercises**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/exercises | List available exercises for user's stage |
| GET | /api/exercises/:slug | Get exercise schema and user's current response |
| POST | /api/exercises/:slug/start | Start or resume an exercise |
| PATCH | /api/exercises/:slug | Save partial progress (auto-save) |
| POST | /api/exercises/:slug/complete | Mark exercise complete, trigger scoring |
| POST | /api/exercises/:slug/retake | Start new version of completed exercise |

## **7.3 Readiness**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/readiness | Get overall readiness score and breakdown |
| GET | /api/readiness/factors | Get detailed factor analysis with recommendations |

# **8\. UI/UX Requirements**

## **8.1 Welcome Flow (Post-Registration)**

* **Screen 1:** Journey overview — visual timeline of stages with current position  
* **Screen 2:** Quick context — timeline intent (single-select), co-buyer status (single-select)  
* **Screen 3:** First exercise prompt — CTA to start Financial Readiness or skip to dashboard

## **8.2 Journey Dashboard**

* **Header:** Current stage badge, readiness score gauge  
* **Progress section:** Exercise cards showing status (not started, in progress, complete)  
* **Next actions:** Prioritized list of recommended steps  
* **Groups section:** Preview of group features with CTA when ready

## **8.3 Exercise Experience**

* **Progress bar:** Question X of Y with estimated time remaining  
* **Question display:** One question per screen (mobile-optimized), clear input controls  
* **Navigation:** Back/Next buttons, ability to skip optional questions  
* **Auto-save:** Visual indicator when saving, no explicit save button  
* **Completion:** Score reveal with context, next exercise suggestion

## **8.4 Readiness Score Display**

* **Gauge:** Circular progress indicator with score and label  
* **Breakdown:** Factor bars showing contribution to overall score  
* **Recommendations:** Actionable tips to improve weak areas

# **9\. Out of Scope (MVP)**

* Gamification (badges, streaks, leaderboards) — Phase 2  
* Exercise recommendations from AI agent — PRD-013  
* Group comparison view of individual exercises — PRD-007  
* Third-party financial data integration (credit score API) — Phase 3

# **10\. Dependencies**

| Dependency | Type | Notes |
| :---- | :---- | :---- |
| PRD-001 | Authentication | User must be authenticated |
| Supabase | Database, Auth | JSONB support for schemas |
| React Hook Form | Frontend library | Dynamic form rendering |
| Zod | Validation library | Schema validation |

# **11\. Open Questions**

1. Should readiness score be visible to potential co-buyers in group formation? NO  
2. How often should we prompt users to update stale exercise responses (\>90 days)?  
3. Should we allow users to see aggregate anonymized data ("Users like you typically...")?) MAYBE IN THE FUTURE  
4. What's the minimum exercise completion to join a group (if any)? ZERO

# **12\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| Journey record created on registration | DB query | 100% |
| Welcome flow completes without errors | Manual test | Pass |
| All 4 exercises render correctly | Manual test | Pass |
| Auto-save persists on page refresh | Manual test | Pass |
| Exercise completion triggers scoring | API test | Pass |
| Readiness score updates on exercise completion | API test | Pass |
| Stage transitions occur at correct thresholds | Unit test | Pass |
| Exercise retake creates new version | DB query | Pass |
| Dashboard shows accurate progress | Manual test | Pass |
| Mobile responsive (exercises usable on phone) | Device test | Pass |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

