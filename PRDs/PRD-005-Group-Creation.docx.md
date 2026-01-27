# **PRD-005: Group Creation & Member Invitation**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 1 — Group Formation |
| **Dependencies** | PRD-001 (Auth), PRD-002 (Personal Journey) |

# **1\. Overview**

This PRD defines the group creation and member invitation system that enables users to form co-buying groups. Groups are the foundational unit for collaborative homeownership on Tomi — they exist independent of a specific property and persist through the entire lifecycle from formation through ownership and eventual exit.

## **1.1 Purpose**

Enable users to create groups, invite potential co-buyers, and manage group membership. The system must support multiple entry paths (existing relationships vs. platform connections), handle the sensitive nature of financial partnerships, and lay the foundation for group-level features like shared documents, AI agents, and financial modeling.

## **1.2 Group Concept**

A group represents a potential or actual co-ownership unit. Key characteristics:

* **People-first:** Groups exist before a property is identified  
* **Persistent:** Groups survive member changes, property changes, and lifecycle transitions  
* **Bounded:** 2-6 members (optimized for 2-4 typical co-buying scenarios)  
* **Multi-membership:** Users can belong to multiple groups simultaneously  
* **Lineage-aware:** Groups can fork or spawn child groups (future)

## **1.3 Entry Paths**

| Path | Description | Flow |
| :---- | :---- | :---- |
| Create & Invite | User has co-buyers in mind, creates group, sends invites | Dashboard → Create Group → Invite Members |
| Accept Invitation | User receives invite link/notification, joins existing group | Invite Link → Review Group → Accept/Decline |
| Platform Match | User matched with compatible co-buyers (future) | Matching → Introductions → Group Formation |

## **1.4 Success Criteria**

* Group creation completes in under 60 seconds  
* Invitation delivery rate exceeds 95% (SMS \+ email)  
* Invitation acceptance rate exceeds 60% within 7 days  
* 80% of groups reach 2+ active members within 14 days  
* Zero unauthorized group access (RLS enforced)

# **2\. User Stories**

## **2.1 Group Creator**

* **US-1:** As a user ready to co-buy, I want to create a group so that I can start collaborating with my potential co-owners.  
* **US-2:** As a group creator, I want to invite people via phone or email so that they can join regardless of whether they're on Tomi.  
* **US-3:** As a group creator, I want to share an invite link so that I can invite people through my preferred channel.  
* **US-4:** As a group creator, I want to see who has accepted or declined so that I know the group's status.

## **2.2 Invited User**

* **US-5:** As an invited user, I want to see who created the group and who else is invited so that I can make an informed decision.  
* **US-6:** As an invited user, I want to accept or decline the invitation so that I can control my participation.  
* **US-7:** As an invited user without a Tomi account, I want to create an account and join in one flow.

## **2.3 Group Member**

* **US-8:** As a group member, I want to view all members and their roles so that I know who I'm working with.  
* **US-9:** As a group member, I want to leave a group so that I can exit if my situation changes.  
* **US-10:** As a group admin, I want to remove a member so that I can manage the group composition.

## **2.4 Multi-Group User**

* **US-11:** As a user in multiple groups, I want to switch between them easily so that I can manage different co-buying options.  
* **US-12:** As a user in multiple groups, I want to see each group's progress separately.

# **3\. Group Lifecycle**

## **3.1 Group Stages**

| Stage | Description | Transition Trigger |
| :---- | :---- | :---- |
| forming | Group created, invites pending, \<2 active members | Group creation |
| active | 2+ active members, working toward purchase | Second member joins |
| aligning | Group exercises in progress | First group exercise started |
| designing | TIC agreement being drafted | TIC builder opened |
| qualifying | Financial qualification in progress | Scenario modeling started |
| searching | Actively looking at properties | Property added to group |
| under\_contract | Offer accepted, closing pending | Property status \= under\_contract |
| closing | In escrow, final steps | Manual status update |
| managing | Property owned, ongoing management | Closing complete |
| dissolved | Group ended without purchase or after sale | Manual dissolution or sale |

## **3.2 Membership States**

| Status | Description | Can Access Group? |
| :---- | :---- | :---- |
| invited | Invitation sent, awaiting response | Preview only |
| active | Full member with access to all group features | Yes |
| suspended | Temporarily removed (e.g., payment issue) | Read-only |
| exited | Voluntarily left or was removed | No |
| declined | Declined invitation | No |

## **3.3 Member Roles**

| Role | Permissions | Assignment |
| :---- | :---- | :---- |
| admin | All member permissions \+ invite/remove members, edit group settings, assign roles | Creator by default, transferable |
| member | View group, participate in exercises, chat, upload docs, vote | Default for invitees |

*Note: Multiple admins allowed. At least one admin must remain. Last admin cannot leave without transferring.*

# **4\. Functional Requirements**

## **4.1 Group Creation**

1. System shall allow authenticated users to create a group  
2. System shall require group name (max 100 characters)  
3. System shall optionally accept group description (max 500 characters)  
4. System shall set creator as admin with 'active' membership  
5. System shall initialize group\_journey record with 'forming' stage  
6. System shall create group\_agent record for AI context  
7. System shall transition creator's personal journey to 'in\_group' stage  
8. System shall generate unique invite code for the group

## **4.2 Invitation System**

1. System shall support invitation via phone number (SMS)  
2. System shall support invitation via email address  
3. System shall generate shareable invite link with unique token  
4. System shall allow inviter to include personal message  
5. System shall set invite expiry (default 14 days, configurable)  
6. System shall enforce maximum pending invites per group (10)  
7. System shall prevent duplicate invites to same phone/email  
8. System shall send invite notification via n8n webhook  
9. System shall track invite status (sent, viewed, accepted, declined, expired)

## **4.3 Joining Flow**

1. System shall validate invite token and check expiry  
2. System shall display group preview: name, creator, member count  
3. System shall require authentication before final acceptance  
4. System shall support new user registration in join flow  
5. System shall link existing user by phone/email match  
6. System shall create membership with 'active' status on acceptance  
7. System shall update invite status to 'accepted' or 'declined'  
8. System shall notify group members of new member  
9. System shall check and enforce group size limit (6 max)

## **4.4 Membership Management**

1. System shall allow members to view all group members and roles  
2. System shall allow admins to remove members (with confirmation)  
3. System shall allow admins to promote members to admin  
4. System shall allow admins to demote other admins (if multiple)  
5. System shall allow members to leave group voluntarily  
6. System shall prevent last admin from leaving without transfer  
7. System shall log all membership changes in membership\_events  
8. System shall notify affected users of membership changes

## **4.5 Group Lifecycle Management**

1. System shall automatically transition stages based on triggers  
2. System shall allow admins to manually update group status  
3. System shall allow admins to dissolve group (with confirmation)  
4. System shall preserve group data on dissolution for historical reference  
5. System shall notify all members of stage transitions

# **5\. Data Model**

## **5.1 Groups Table (public.groups)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| name | VARCHAR(100) | Group display name |
| description | TEXT | Optional description |
| status | VARCHAR(50) | active, dissolved |
| invite\_code | VARCHAR(20) | Unique shareable code |
| max\_members | INTEGER | Default 6 |
| settings | JSONB | Group-level settings |
| parent\_group\_id | UUID FK | For forked groups (future) |
| created\_by | UUID FK | Creator user ID |
| created\_at | TIMESTAMPTZ | Creation timestamp |
| updated\_at | TIMESTAMPTZ | Last update |

## **5.2 Memberships Table (public.memberships)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| user\_id | UUID FK | Member user ID |
| group\_id | UUID FK | Group ID |
| role | VARCHAR(50) | admin, member |
| status | VARCHAR(50) | invited, active, suspended, exited, declined |
| ownership\_pct | DECIMAL(5,4) | Ownership percentage (set later) |
| invited\_by | UUID FK | Who sent the invite |
| invited\_at | TIMESTAMPTZ | Invite timestamp |
| joined\_at | TIMESTAMPTZ | When accepted |
| exited\_at | TIMESTAMPTZ | When left/removed |
| exit\_reason | VARCHAR(100) | voluntary, removed, group\_dissolved |

**Unique constraint:** (user\_id, group\_id)

## **5.3 Invitations Table (public.invitations)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Target group |
| token | VARCHAR(64) | Unique invite token |
| invite\_type | VARCHAR(20) | phone, email, link |
| recipient\_phone | VARCHAR(20) | Phone number if SMS invite |
| recipient\_email | VARCHAR(255) | Email if email invite |
| personal\_message | TEXT | Custom message from inviter |
| invited\_by | UUID FK | Inviter user ID |
| status | VARCHAR(50) | pending, sent, viewed, accepted, declined, expired |
| sent\_at | TIMESTAMPTZ | When notification sent |
| viewed\_at | TIMESTAMPTZ | When recipient viewed |
| responded\_at | TIMESTAMPTZ | When accepted/declined |
| expires\_at | TIMESTAMPTZ | Invitation expiry |
| created\_at | TIMESTAMPTZ | Created timestamp |

## **5.4 Membership Events Table (public.membership\_events)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| membership\_id | UUID FK | Related membership |
| event\_type | VARCHAR(50) | invited, accepted, declined, activated, suspended, exited, role\_changed |
| triggered\_by | UUID FK | User who triggered (null if system) |
| metadata | JSONB | Event-specific data |
| created\_at | TIMESTAMPTZ | Event timestamp |

## **5.5 Group Journeys Table (public.group\_journeys)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Group reference (unique) |
| stage | VARCHAR(50) | Current journey stage |
| alignment\_score | INTEGER | Computed from group exercises |
| target\_close\_date | DATE | Target closing date |
| current\_step | VARCHAR(100) | Active milestone/exercise |
| blockers | JSONB | Array of blocking items |
| created\_at | TIMESTAMPTZ | Created timestamp |
| updated\_at | TIMESTAMPTZ | Last update |

# **6\. Invitation Flow Details**

## **6.1 SMS Invitation Flow**

| Step | Action | System Response |
| :---- | :---- | :---- |
| 1 | Admin enters phone number | Validates format, checks for existing invite |
| 2 | Admin adds personal message (optional) | Stores message with invite |
| 3 | Admin clicks Send | Creates invitation record, triggers n8n webhook |
| 4 | n8n sends SMS via Twilio | Updates invite status to 'sent' |
| 5 | Recipient clicks link in SMS | Opens invite preview page, marks 'viewed' |
| 6a | (Existing user) Logs in | Matches by phone, shows accept/decline |
| 6b | (New user) Signs up | Pre-fills phone, creates account |
| 7 | User accepts/declines | Updates invite, creates membership if accepted |

## **6.2 Email Invitation Flow**

Same as SMS flow, but notification sent via email. Email includes group name, inviter name, personal message, and prominent CTA button.

## **6.3 Shareable Link Flow**

| Step | Action | System Response |
| :---- | :---- | :---- |
| 1 | Admin clicks 'Copy Invite Link' | Generates link with group invite\_code |
| 2 | Admin shares link via any channel | — |
| 3 | Recipient opens link | Shows group preview (no invite record yet) |
| 4 | Recipient clicks 'Request to Join' | Creates invitation with type 'link' |
| 5 | User authenticates | Links invitation to user |
| 6 | User confirms join | Creates membership |

*Note: Link-based invites auto-accept if group is open. Future: admin approval mode.*

## **6.4 Invite Message Templates**

SMS template (via Twilio):

{inviter\_name} invited you to join "{group\_name}" on Tomi, 

a co-buying platform. {personal\_message}

Join here: {invite\_url}

Link expires in 14 days.

Email subject:

{inviter\_name} invited you to co-buy a home together

# **7\. API Endpoints**

## **7.1 Groups**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups | List user's groups (all memberships) |
| POST | /api/groups | Create new group |
| GET | /api/groups/:id | Get group details |
| PATCH | /api/groups/:id | Update group (name, description, settings) |
| DELETE | /api/groups/:id | Dissolve group (admin only) |
| GET | /api/groups/:id/journey | Get group journey state |

## **7.2 Memberships**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/members | List group members |
| PATCH | /api/groups/:id/members/:userId | Update member (role change) |
| DELETE | /api/groups/:id/members/:userId | Remove member (admin) or leave (self) |
| GET | /api/groups/:id/members/events | Get membership event history |

## **7.3 Invitations**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/invitations | List pending invitations |
| POST | /api/groups/:id/invitations | Create invitation (phone/email) |
| DELETE | /api/groups/:id/invitations/:inviteId | Cancel/revoke invitation |
| POST | /api/groups/:id/invitations/:inviteId/resend | Resend invitation notification |
| GET | /api/invitations/:token | Get invite details by token (public) |
| POST | /api/invitations/:token/accept | Accept invitation |
| POST | /api/invitations/:token/decline | Decline invitation |

## **7.4 Invite Links**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/invite-link | Get/generate shareable invite link |
| POST | /api/groups/:id/invite-link/regenerate | Regenerate invite code (invalidates old) |
| GET | /api/join/:code | Get group preview by invite code (public) |
| POST | /api/join/:code | Join group via invite code |

# **8\. n8n Webhook Integration**

## **8.1 Invitation Events**

| Event | Trigger | Notification Channel |
| :---- | :---- | :---- |
| invitation.created | New invitation created | SMS or Email (per invite\_type) |
| invitation.reminder | 3 days before expiry | Same as original |
| invitation.accepted | Recipient accepts | Notify inviter (push/email) |
| invitation.declined | Recipient declines | Notify inviter (push/email) |

## **8.2 Membership Events**

| Event | Trigger | Notification Channel |
| :---- | :---- | :---- |
| member.joined | New member joins | Notify all members |
| member.left | Member leaves voluntarily | Notify all members |
| member.removed | Member removed by admin | Notify removed \+ all members |
| member.role\_changed | Role updated | Notify affected member |

## **8.3 Webhook Payload Example**

// Event: invitation.created

{  
  "event\_type": "invitation.created",  
  "timestamp": "2024-12-15T10:30:00Z",  
  "group\_id": "abc-123",  
  "group\_name": "Oak Street Co-buyers",  
  "invitation": {  
    "id": "inv-456",  
    "type": "phone",  
    "recipient": "+14155551234",  
    "invite\_url": "https://tomi.app/join/xyz789",  
    "expires\_at": "2024-12-29T10:30:00Z"  
  },  
  "inviter": {  
    "id": "user-789",  
    "name": "Alex Chen",  
    "message": "Hey\! Let's explore buying together."  
  }  
}

# **9\. UI/UX Requirements**

## **9.1 Group Creation Flow**

* **Step 1 \- Name:** Group name input with character counter, optional description  
* **Step 2 \- Invite:** Add members by phone/email, or skip to invite later  
* **Step 3 \- Confirm:** Review group details, create group  
* **Success:** Redirect to group dashboard with invite link copy option

## **9.2 Group Dashboard**

* **Header:** Group name, stage badge, member avatars  
* **Members section:** List with roles, invite button, pending invites  
* **Journey progress:** Visual stage indicator, next steps  
* **Quick actions:** Start exercise, view documents, open chat  
* **Settings gear:** Access group settings (admin only)

## **9.3 Invite Modal**

* **Tab 1 \- Phone:** Phone input with country code, optional message  
* **Tab 2 \- Email:** Email input, optional message  
* **Tab 3 \- Link:** Copy invite link button, QR code option  
* **Footer:** Show pending invite count, link to manage invites

## **9.4 Invite Preview Page (Public)**

* **Group info:** Name, description, member count  
* **Inviter info:** Name, avatar, personal message  
* **CTA:** 'Join Group' button (requires auth)  
* **Secondary:** 'Decline' link  
* **Expiry notice:** Show days remaining

## **9.5 Group Switcher**

* **Location:** Header dropdown (when user has multiple groups)  
* **Content:** Group name, stage badge, unread indicator  
* **Actions:** Switch group, create new group  
* **Personal link:** 'My Journey' to return to individual view

## **9.6 Member Management**

* **Member card:** Avatar, name, role badge, joined date  
* **Actions menu:** Change role (admin only), remove (admin only)  
* **Leave button:** Self-service exit with confirmation  
* **Pending invites:** Separate section with resend/cancel options

# **10\. Security & Access Control**

## **10.1 Row Level Security**

\-- Groups: members can view, admins can update

CREATE POLICY groups\_member\_read ON groups  
FOR SELECT USING (  
  id IN (  
    SELECT group\_id FROM memberships  
    WHERE user\_id \= auth.uid()  
    AND status IN ('active', 'suspended')  
  )  
);

CREATE POLICY groups\_admin\_update ON groups  
FOR UPDATE USING (  
  id IN (  
    SELECT group\_id FROM memberships  
    WHERE user\_id \= auth.uid()  
    AND role \= 'admin'  
    AND status \= 'active'  
  )  
);

## **10.2 Invitation Token Security**

* Tokens generated using crypto.randomBytes(32)  
* Tokens are single-use (consumed on accept)  
* Tokens expire after 14 days  
* Invite links do not expose group ID directly  
* Rate limiting on invite creation: 10/hour per user

# **11\. Dependencies**

| Dependency | Type | Purpose |
| :---- | :---- | :---- |
| PRD-001 | Auth system | User authentication for all operations |
| PRD-002 | Personal journey | Stage transition on group join |
| n8n | External service | Notification delivery (SMS, email) |
| Twilio | External service | SMS delivery (via n8n) |
| Supabase | Infrastructure | Database, RLS, real-time subscriptions |

# **12\. Out of Scope (MVP)**

* Platform-based co-buyer matching — future feature  
* Admin approval mode for link invites — auto-accept for MVP  
* Group forking/splitting — lineage tracking only  
* Ownership percentage assignment — deferred to TIC builder  
* Bulk invitation import (CSV)  
* In-app calendar for group scheduling

# **13\. Open Questions**

1. Should we require exercise completion before joining a group?  
2. Default invite expiry: 7 days or 14 days?  
3. Allow group name changes after creation, or lock to prevent confusion?  
4. Show member readiness scores to other members during formation?

# **14\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| User can create group with name | Manual test | Pass |
| Creator assigned admin role | DB query | Pass |
| SMS invitation delivered | E2E test | \<30s |
| Email invitation delivered | E2E test | \<60s |
| Invite link generates correctly | Manual test | Pass |
| New user can sign up via invite | Manual test | Pass |
| Existing user can join via invite | Manual test | Pass |
| Member can leave group | Manual test | Pass |
| Admin can remove member | Manual test | Pass |
| Last admin cannot leave | Manual test | Pass |
| RLS prevents unauthorized access | Security test | Pass |
| Group switcher works with 3+ groups | Manual test | Pass |
| Membership events logged | DB query | 100% |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

