# **PRD-011: Partner Referrals**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Phase 2 — Foundation Only |
| **Date** | December 2024 |
| **Dependencies** | PRD-001 (Auth), PRD-005 (Groups) |

# **1\. Overview**

Foundation for Tomi's partner referral system. Phase 1: manual facilitation. Phase 2: self-service directory.

## **1.1 Phase 1 (Current)**

* Tomi manually facilitates partner introductions  
* Groups request referrals via Homi or support  
* Data model deployed, UI deferred

## **1.2 Phase 2 (Future)**

* Partner directory with search/filter  
* Contextual recommendations in TIC Builder  
* Partner dashboard, referral tracking

## **1.3 Partner Types**

| Type | Priority | Notes |
| :---- | :---- | :---- |
| Attorneys | Phase 2 First | TIC agreement review, real estate closings |
| Lenders | Phase 2 | TIC-friendly mortgage products |
| Real Estate Agents | Phase 2 | Co-ownership certified preferred |
| Title/Insurance/CPA | Phase 3 | Specialized services |

# **2\. Data Model**

## **2.1 Partners (public.partners)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| user\_id | UUID FK | Optional link to user account |
| type | VARCHAR(50) | attorney, lender, agent, title, insurance, cpa |
| status | VARCHAR(20) | invited, pending\_review, active, inactive, removed |
| company\_name | VARCHAR(200) | Business name |
| contact\_name | VARCHAR(100) | Primary contact |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(20) | Contact phone |
| website | VARCHAR(255) | Company website |
| service\_areas | JSONB | Array of state codes: \["MN", "CA"\] |
| agreement\_signed\_at | TIMESTAMPTZ | Partnership agreement date |
| invited\_by | UUID FK | Tomi team member who invited |
| notes | TEXT | Internal notes |
| created\_at | TIMESTAMPTZ | Created timestamp |
| updated\_at | TIMESTAMPTZ | Last updated |

## **2.2 Referral Requests (public.referral\_requests)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Requesting group |
| requested\_by | UUID FK | User who initiated request |
| partner\_type | VARCHAR(50) | Type of partner requested |
| status | VARCHAR(20) | pending, matched, intro\_sent, connected, closed, cancelled |
| context | JSONB | {group\_size, home\_price\_range, timeline, state, specific\_need} |
| partner\_id | UUID FK | Matched partner (when assigned) |
| intro\_sent\_at | TIMESTAMPTZ | When intro was facilitated |
| outcome | VARCHAR(50) | engaged, not\_engaged, deal\_closed, unknown |
| outcome\_notes | TEXT | Outcome details |
| created\_at | TIMESTAMPTZ | Request timestamp |
| updated\_at | TIMESTAMPTZ | Last updated |

## **2.3 Service Area Coverage (public.service\_area\_coverage)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| state\_code | VARCHAR(2) | US state code |
| partner\_type | VARCHAR(50) | attorney, lender, agent, etc. |
| status | VARCHAR(20) | available, coming\_soon, unavailable |
| partner\_count | INTEGER | Number of active partners |

# **3\. API Endpoints**

## **3.1 Partners (Admin)**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/admin/partners | List all partners |
| POST | /api/admin/partners | Create/invite partner |
| GET | /api/admin/partners/:id | Get partner details |
| PUT | /api/admin/partners/:id | Update partner |
| PUT | /api/admin/partners/:id/status | Change partner status |

## **3.2 Referral Requests**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/groups/:groupId/referrals | Request partner referral for group |
| GET | /api/groups/:groupId/referrals | List group's referral requests |
| GET | /api/groups/:groupId/referrals/:id | Get referral request details |
| PUT | /api/admin/referrals/:id | Update request (admin) |
| PUT | /api/admin/referrals/:id/outcome | Record referral outcome |

## **3.3 Coverage Check**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/coverage/:stateCode | Check partner availability by state |
| GET | /api/coverage/:stateCode/:partnerType | Check specific partner type |

## **3.4 Phase 2: Partner Directory (Future)**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/partners | Public partner directory search |
| GET | /api/partners/:id | Public partner profile |
| GET | /api/partners/me | Partner's own profile |
| PUT | /api/partners/me | Partner updates profile |
| GET | /api/partners/me/referrals | Partner views referrals |

# **4\. Initial Service Areas**

| State | Status | Notes |
| :---- | :---- | :---- |
| Minnesota (MN) | Coming Soon | Primary market |
| California (CA) | Coming Soon | Large TIC market |
| All Other States | Unavailable | Show "Coming soon" |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Foundation — data model and API endpoints only |

