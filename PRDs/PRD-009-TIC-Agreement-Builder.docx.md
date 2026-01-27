# **PRD-009: TIC Agreement Builder**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 2 — Pre-Closing |
| **Dependencies** | PRD-007 (Group Exercises), PRD-008 (Group Docs) |

# **1\. Overview**

This PRD defines the TIC Agreement Builder — the system that transforms individual preferences and group alignment into a legally-structured Tenants-in-Common Agreement. The TIC Agreement is Tomi's foundational document, establishing the commercial, financial, and social responsibilities of all parties including Tomi's role as a passive 1% interest holder.

## **1.1 Purpose**

Guide co-buyers through understanding, customizing, and executing their TIC Agreement via an AI-assisted, educational process. The system breaks down complex legal language into digestible exercises, surfaces alignment/misalignment before it becomes conflict, and ensures all parties understand their rights and obligations before signing.

## **1.2 Core Philosophy**

* **Transformational, not transactional:** The TIC process should educate and align, not just collect signatures  
* **Transparency over complexity:** Every section explainable in plain language by the Homi agent  
* **Tomi-controlled \+ negotiable:** Some sections protect the structure; others reflect group consensus  
* **Unanimous consent for changes:** Any language modification requires all co-owners to approve  
* **Not legal advice:** Clear disclaimers that Tomi is not a law firm; attorney review strongly recommended

## **1.3 TIC Agreement Structure**

The TIC Agreement has two types of sections:

| Type | Description | Examples |
| :---- | :---- | :---- |
| Tomi-Controlled | Non-negotiable language protecting legal structure, Tomi's role, and core mechanics | Tomi 1% ownership, voting formula, duty of good faith, indemnification |
| Negotiable | Customizable based on group preferences and alignment exercises | Expense allocation, space usage, guest policies, appraisal count |

## **1.4 Process Flow**

TIC Agreement Journey:

┌─────────────────────────────────────────────────────────────────────────┐  
│                      TIC AGREEMENT BUILDER FLOW                         │  
├─────────────────────────────────────────────────────────────────────────┤  
│                                                                         │  
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │  
│  │   PHASE 1    │    │   PHASE 2    │    │   PHASE 3    │              │  
│  │  Individual  │───▶│  Alignment   │───▶│    Live      │              │  
│  │  Exercises   │    │  Analysis    │    │  Facilitation│              │  
│  └──────────────┘    └──────────────┘    └──────────────┘              │  
│        │                   │                   │                       │  
│        ▼                   ▼                   ▼                       │  
│   Each member         AI surfaces         Video call \+                │  
│   completes           alignment &         in-app Homi                 │  
│   preferences         misalignment        support                     │  
│                                                                         │  
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │  
│  │   PHASE 4    │    │   PHASE 5    │    │   PHASE 6    │              │  
│  │   Draft      │───▶│   Attorney   │───▶│   E-Sign     │              │  
│  │  Generation  │    │   Review     │    │              │              │  
│  └──────────────┘    └──────────────┘    └──────────────┘              │  
│        │                   │                   │                       │  
│        ▼                   ▼                   ▼                       │  
│   TIC populated       Export PDF,         Google Docs                 │  
│   from exercise       attorney reviews    signatures                  │  
│   resolutions         externally          collected                   │  
│                                                                         │  
└─────────────────────────────────────────────────────────────────────────┘

## **1.5 Success Criteria**

* 100% of co-owners complete educational exercises before signing  
* Homi can explain any TIC section in plain language  
* Unanimous consent captured for all negotiable terms  
* State-specific templates available for target markets  
* Attorney referral offered to 100% of groups  
* E-sign completion rate \>90% within 7 days of draft finalization

# **2\. User Stories**

## **2.1 Understanding & Education**

* **US-1:** As a co-buyer, I want the TIC explained in plain language so I understand what I'm signing.  
* **US-2:** As a co-buyer, I want to ask Homi questions about any section so I can clarify confusion.  
* **US-3:** As a co-buyer, I want to know why certain sections can't be changed so I understand the structure.  
* **US-4:** As a co-buyer, I want 'what if' scenarios answered so I understand real-world implications.

## **2.2 Customization**

* **US-5:** As a co-buyer, I want to propose language changes so my preferences are represented.  
* **US-6:** As a co-buyer, I want to vote on proposed changes so the group reaches consensus.  
* **US-7:** As a co-buyer, I want Homi to draft language suggestions so I don't need legal expertise.  
* **US-8:** As a co-buyer, I want inline comments so I can discuss specific language with my co-owners.

## **2.3 Review & Signing**

* **US-9:** As a co-buyer, I want to export the draft for attorney review so I get professional guidance.  
* **US-10:** As a co-buyer, I want to be connected with local housing attorneys so I can find qualified help.  
* **US-11:** As a co-buyer, I want to e-sign the final agreement so we can complete the process digitally.  
* **US-12:** As a co-buyer, I want the signed agreement stored and embedded in Homi's knowledge so it's always accessible.

# **3\. TIC Section Breakdown**

The TIC Agreement is structured into sections based on the Tomi Co-Ownership Agreement template. Each section is classified as Tomi-controlled or negotiable, with mapped prerequisite exercises.

## **3.1 Section Registry**

| \# | Section Name | Editable | User Inputs | Prerequisite Exercises |
| :---- | :---- | :---- | :---- | :---- |
| — | Recitals & Parties | Partial | Names, property | Member data, property selection |
| I | Duty of Good Faith | 🔒 No | None | — |
| II | Terms of Agreement | ✓ Yes | Guest policy, common spaces | grp\_space\_allocation |
| III | Expense Allocations | ✓ Yes | % split, utility handling | grp\_financial\_contribution |
| IV | Transfer Restrictions | Partial | Notice period | grp\_exit\_buyout |
| V | Property Sale or Buyout | Partial | \# appraisals, notice days | grp\_exit\_buyout |
| VI | Distribution of Proceeds | 🔒 No | None (Tomi 1%) | grp\_financial\_contribution |
| VII | Death of Co-Tenant | Partial | Occupancy period | grp\_exit\_buyout |
| VIII | Notices | 🔒 No | None | — |
| IX | Title and Allocations | 🔒 No | None | — |
| X | Partnership Not Intended | 🔒 No | None | — |
| XI | Governance | Partial | Meeting cadence | grp\_governance\_model |
| XII | Dispute Resolution | Partial | Mediation preferences | grp\_governance\_model |
| XIII | Remedial Actions | 🔒 No | None | — |
| XIV | Use Restrictions | ✓ Yes | Rules, pets, etc. | grp\_space\_allocation |
| XV | Attorney Fees | 🔒 No | None | — |
| XVI | Miscellaneous & Tomi Provisions | 🔒 No | None | — |
| — | Signature Pages | 🔒 No | Signatures | All exercises complete |
| — | Appendix: Definitions | 🔒 No | None | — |
| — | Schedule: Property Description | Partial | Legal description | Property selection |

## **3.2 Tomi-Controlled Elements (Non-Negotiable)**

These elements cannot be modified by co-owners:

* **Tomi's 1% ownership interest:** Passive interest with corresponding proceeds share  
* **Tomi Transaction Fee structure:** As defined in Real Estate Services Agreement  
* **Voting formula:** Proportional to ownership percentage (Tomi has no vote)  
* **Partition waiver:** Each member must sign willingness to forfeit partition action rights  
* **Tax election:** IRC Section 761 election out of subchapter K  
* **Indemnification:** Tomi indemnification provisions  
* **Arbitration default:** Tomi-managed arbitration as primary dispute resolution  
* **Duty of good faith:** Fiduciary relationship language

## **3.3 Negotiable Elements (Group Customizable)**

These elements can be customized via exercises and unanimous consent:

* **Expense allocation percentages:** How costs are split among co-owners  
* **Utility handling:** Equal split vs. proportional vs. custom  
* **Guest policies:** Overnight stays, duration limits, approval requirements  
* **Common space definitions:** What's shared vs. exclusive  
* **Use restrictions:** Pets, smoking, noise, etc.  
* **Number of appraisals for buyout:** 1-4 qualified appraisers  
* **Notice periods:** Intent to sell notice duration  
* **Meeting cadence:** How often formal meetings occur  
* **Mediation preferences:** Selection of mediator, timing

# **4\. Homi Agent Capabilities**

The Homi agent is the primary interface for TIC education and customization. It must be knowledgeable, transparent about its limitations, and clear about what can and cannot be changed.

## **4.1 Explain Any Section**

Homi can explain any TIC section in plain language:

User: "What does 'Distribution of Proceeds' mean?"

Homi: "This section explains how money gets divided when the  
property is sold or someone buys out a co-owner. The key points:

• Each co-owner gets their ownership percentage of the proceeds  
• Tomi receives 1% as the passive interest holder  
• Any debts you owe other co-owners get deducted from your share first  
• The Tomi Transaction Fee is taken directly from the sale price

For example, if you own 33% and the property sells for $600K,  
you'd receive roughly $198K before fees and debt adjustments.

⚠️ This section is Tomi-controlled and cannot be modified.  
This protects all parties by ensuring fair distribution."

## **4.2 Explain Why Sections Are Locked**

User: "Why can't we change the voting structure?"

Homi: "The voting structure is Tomi-controlled for several reasons:

1\. Legal consistency: TIC structures require clear, predictable  
   governance. Courts and lenders expect proportional voting.

2\. Fairness: Votes proportional to ownership ensures those with  
   more financial stake have proportional say in decisions.

3\. Tomi's role: As a passive 1% holder, Tomi has no vote — this  
   is intentional to keep control with active co-owners.

What you CAN customize is how different types of decisions are  
classified (Routine, General, Major, Unanimous). Want me to  
explain those categories?"

## **4.3 Answer 'What If' Scenarios**

User: "What happens if I want to sell in 2 years?"

Homi: "Based on your current TIC terms, here's what would happen:

1\. Transfer Restriction Period: Your agreement has a 5-year  
   no-transfer period. Selling in 2 years would require written  
   approval from ALL other co-owners.

2\. If approved (or after 5 years):  
   • You provide 30 days written notice of intent to sell  
   • Within 14 days, appraisals are initiated (you chose 2\)  
   • Other co-owners have first right to buy you out  
   • If no buyout, property is listed at appraised value

3\. Your proceeds: Your 33% share minus the Tomi Transaction Fee  
   and any outstanding obligations to other co-owners.

⚠️ DISCLAIMER: This is not legal advice. I may be wrong about  
specific interpretations. Please consult with an attorney for  
definitive guidance on your situation."

## **4.4 Draft Language Suggestions**

When users want to modify negotiable sections, Homi can suggest language:

User: "We want to allow pets under 25 lbs"

Homi: "I can suggest language for the Use Restrictions section.  
Here's a draft:

\---  
"Pets: Co-Tenant/Owners may keep domestic pets on the Property  
subject to the following conditions: (i) pets shall not exceed  
25 pounds in weight; (ii) pet owners are solely responsible for  
any damage caused by their pets to Common Spaces or other Co-  
Tenant/Owners' Exclusive Spaces; (iii) all applicable HOA rules  
and local ordinances regarding pets shall be followed."  
\---

This language requires unanimous consent from all co-owners.  
Would you like me to submit this for group approval?

⚠️ DISCLAIMER: This is AI-generated language, not legal advice.  
An attorney should review any changes before signing."

## **4.5 Required Disclaimers**

Homi must display these disclaimers contextually:

| Context | Disclaimer | Display |
| :---- | :---- | :---- |
| Session start | "Tomi is not a law firm. This is educational information, not legal advice. We strongly recommend attorney review before signing." | Modal acknowledgment |
| 'What if' questions | "This is not legal advice. I may be wrong. Please consult an attorney for your specific situation." | Inline after response |
| Language suggestions | "This is AI-generated language. An attorney should review any changes before signing." | Inline after suggestion |
| Before signing | "You are about to sign a legally binding agreement. Have you consulted with an attorney? \[Yes/No/Skip\]" | Blocking modal |

# **5\. Unanimous Consent Workflow**

Any modification to negotiable TIC language requires unanimous consent from all co-owners. This ensures no one is surprised by terms they didn't agree to.

## **5.1 Change Request Flow**

Unanimous Consent Process:

┌──────────────┐     ┌──────────────┐     ┌──────────────┐  
│   Member     │     │   Create     │     │   Notify     │  
│   Proposes   │────▶│   Change     │────▶│   All        │  
│   Change     │     │   Request    │     │   Members    │  
└──────────────┘     └──────────────┘     └──────────────┘  
                                                │  
                                                ▼  
                                          ┌──────────────┐  
                     ┌────────────────────│   Voting     │  
                     │                    │   Period     │  
                     │                    │   (7 days)   │  
                     ▼                    └──────────────┘  
              ┌──────────────┐  
              │  All Approve │──Yes──▶ Change Applied  
              │      ?       │  
              └──────────────┘  
                     │ No  
                     ▼  
              Change Rejected (show who declined)

## **5.2 Change Request Record**

change\_request: {

  "id": "cr-123",  
  "group\_id": "group-456",  
  "section\_id": "tic\_section\_14",  
  "section\_name": "Use Restrictions",  
  "proposed\_by": "user-789",  
  "proposed\_at": "2024-12-15T10:00:00Z",  
  "change\_type": "add",  // add, modify, remove  
  "original\_text": null,  
  "proposed\_text": "Pets: Co-Tenant/Owners may keep domestic pets...",  
  "rationale": "We all want to be able to have small dogs",  
  "ai\_generated": true,  
  "status": "pending",  // pending, approved, rejected, expired  
  "votes": \[  
    { "user\_id": "user-789", "vote": "approve", "voted\_at": "..." },  
    { "user\_id": "user-101", "vote": "approve", "voted\_at": "..." },  
    { "user\_id": "user-102", "vote": null }  // pending  
  \],  
  "expires\_at": "2024-12-22T10:00:00Z",  
  "resolved\_at": null  
}

## **5.3 Voting Rules**

* **Unanimity required:** All active co-owners must approve  
* **Voting period:** 7 days from proposal (configurable)  
* **Early resolution:** If all vote before deadline, resolve immediately  
* **Single rejection:** One 'reject' vote immediately rejects the proposal  
* **Expiration:** Non-votes after deadline \= automatic rejection  
* **Audit trail:** All votes logged with timestamp and IP

# **6\. Live Facilitation Process**

Before the TIC draft is generated, groups participate in a live facilitation session to work through alignment analysis and resolve outstanding differences.

## **6.1 Session Structure**

| Step | Duration | Activity | Facilitator |
| :---- | :---- | :---- | :---- |
| 1 | 5 min | Introductions, ground rules, session goals | Tomi rep |
| 2 | 10 min | Review alignment analysis summary | Tomi rep \+ Homi |
| 3 | 30-45 min | Work through misalignment topics one by one | Tomi rep |
| 4 | 15 min | Confirm resolutions, capture consensus language | Tomi rep \+ Homi |
| 5 | 10 min | Preview TIC sections, Q\&A, attorney referral | Tomi rep |
| 6 | 5 min | Next steps, timeline to signing | Tomi rep |

## **6.2 Facilitation Tools**

* **Video call:** Zoom/Google Meet hosted by Tomi rep  
* **In-app Homi:** All members have Homi open for real-time questions  
* **Alignment dashboard:** Screen-shared view of alignment/misalignment topics  
* **Live polling:** In-app voting for quick consensus checks  
* **Session recording:** Optional recording for reference (with consent)

## **6.3 Post-Session Deliverables**

* Session summary emailed to all co-owners  
* Resolution decisions recorded in system  
* TIC draft generation triggered  
* Attorney referral list provided (state-specific)

# **7\. State-Specific Templates**

TIC law varies by state. The system maintains state-specific templates with appropriate language, governing law clauses, and attorney referral networks.

## **7.1 Template Management**

| Component | State-Specific? | Notes |
| :---- | :---- | :---- |
| Governing Law clause | Yes | References state statutes |
| Dispute resolution venue | Yes | County/jurisdiction specified |
| Notice requirements | Partial | Some states have specific requirements |
| Recording requirements | Yes | Some states require TIC recording |
| Tax implications | Yes | State tax treatment varies |
| Attorney referral network | Yes | Local housing law specialists |

## **7.2 MVP Target States**

* **Minnesota:** Primary launch market  
* **California:** Large TIC market, established case law  
* **Others:** Expansion based on demand, with disclaimer about attorney review

# **8\. Attorney Review Integration**

Attorney review is strongly recommended but not required. Tomi provides referrals to local housing law specialists and export functionality for external review.

## **8.1 Referral Network**

* Curated list of attorneys specializing in housing/real estate law  
* Filtered by state where property is located  
* Includes experience with TIC structures specifically  
* Contact info and typical fee ranges displayed  
* Not exclusive — users can use any attorney

## **8.2 Export for Review**

* **PDF export:** Clean PDF of current draft for attorney markup  
* **Word export:** DOCX for attorneys who prefer track changes  
* **Change summary:** Document highlighting all negotiable terms chosen  
* **Annotation import:** Future: import attorney comments back into system

## **8.3 Bypass Option**

Users can proceed without attorney review, but must acknowledge:

"I understand that Tomi strongly recommends attorney review before signing this legally binding agreement. I have chosen to proceed without attorney review and accept responsibility for this decision. I understand Tomi is not a law firm and has not provided legal advice."

# **9\. E-Signature via Google Docs**

Final agreement is signed electronically using Google Docs native e-signature functionality. A Tomi representative manages the signing process and uploads the completed document to the group data room.

## **9.1 Signing Flow**

| Step | Action | Actor |
| :---- | :---- | :---- |
| 1 | TIC draft finalized after all resolutions | System |
| 2 | Tomi rep creates Google Doc from template \+ resolutions | Tomi rep |
| 3 | Signature request sent to all co-owners via Google | Tomi rep |
| 4 | Each co-owner reviews and signs in Google Docs | Co-owners |
| 5 | Tomi rep signs as passive 1% interest holder | Tomi rep |
| 6 | Fully executed PDF uploaded to group data room | Tomi rep |
| 7 | Agreement embedded in Homi RAG knowledge base | System |

## **9.2 Signature Requirements**

* All active co-owners must sign  
* Tomi representative signs on behalf of Tomi Homes, Inc.  
* Notarization handled separately if required by state  
* 7-day signing window (reminders at 3 days, 1 day)

# **10\. Version Control**

The TIC draft goes through multiple iterations. The system maintains version snapshots at meaningful milestones.

## **10.1 Version Triggers**

* **Initial draft:** v1.0 created after facilitation session  
* **Change approved:** Minor version bump (v1.1, v1.2) for each approved change  
* **Attorney feedback incorporated:** Major version bump (v2.0)  
* **Final for signing:** Locked version marked 'FINAL'  
* **Post-signing amendment:** Creates addendum document (not new TIC version)

## **10.2 Version Record**

tic\_version: {

  "id": "tic-v-123",  
  "tic\_id": "tic-456",  
  "version": "1.2",  
  "status": "draft",  // draft, review, final, signed, amended  
  "created\_at": "2024-12-15T14:00:00Z",  
  "created\_by": "system",  // or user\_id for manual saves  
  "trigger": "change\_approved",  
  "change\_request\_id": "cr-789",  
  "snapshot": { /\* full TIC data at this version \*/ },  
  "notes": "Added pet policy per unanimous consent"  
}

# **11\. Post-Signing Amendments**

After the TIC is signed, modifications are handled via addendum documents that reference the original agreement.

## **11.1 Amendment Process**

* Co-owner proposes amendment via same change request flow  
* Unanimous consent required (same as pre-signing changes)  
* Addendum document generated referencing original TIC  
* All co-owners \+ Tomi must sign addendum  
* Addendum stored alongside original in data room  
* Homi RAG updated with addendum content

# **12\. Functional Requirements**

## **12.1 TIC Structure**

1. System shall maintain section-level editability flags (Tomi-controlled vs negotiable)  
2. System shall map exercises to TIC sections (many:1 relationship)  
3. System shall populate TIC fields from exercise resolutions  
4. System shall display locked sections with visual indicator  
5. System shall maintain state-specific templates

## **12.2 Workflow**

1. System shall block TIC generation until required exercises complete  
2. System shall generate TIC draft after facilitation session  
3. System shall track version history at meaningful milestones  
4. System shall support PDF and DOCX export  
5. System shall integrate with Google Docs for e-signature

## **12.3 Homi Agent**

1. System shall enable Homi to explain any TIC section in plain language  
2. System shall enable Homi to explain why sections are locked  
3. System shall enable Homi to answer 'what if' scenarios with disclaimers  
4. System shall enable Homi to draft language suggestions for negotiable sections  
5. System shall display contextual legal disclaimers  
6. System shall require upfront acknowledgment that Tomi is not a law firm

## **12.4 Unanimous Consent**

1. System shall require unanimous consent for any TIC language modification  
2. System shall create change request with 7-day voting period  
3. System shall resolve immediately if all vote before deadline  
4. System shall reject immediately on first 'reject' vote  
5. System shall log all votes with timestamp and IP  
6. System shall notify all members of change requests and outcomes

## **12.5 Signing**

1. System shall prompt attorney review recommendation before signing  
2. System shall allow bypass with explicit acknowledgment  
3. System shall track signing status per co-owner  
4. System shall upload signed document to group data room  
5. System shall embed signed TIC in Homi RAG knowledge base

# **13\. Data Model**

## **13.1 TIC Templates (public.tic\_templates)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| state\_code | VARCHAR(2) | US state code (MN, CA, etc.) |
| version | VARCHAR(20) | Template version |
| effective\_date | DATE | When template became active |
| sections | JSONB | Section definitions with editability flags |
| is\_active | BOOLEAN | Currently active template |
| created\_at | TIMESTAMPTZ | Created timestamp |

## **13.2 TIC Agreements (public.tic\_agreements)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Group reference (unique) |
| template\_id | UUID FK | Base template used |
| status | VARCHAR(50) | draft, review, signing, signed, amended |
| current\_version | VARCHAR(20) | Current version number |
| sections\_data | JSONB | Section values (filled in) |
| signed\_document\_id | UUID FK | Reference to signed PDF in documents |
| signed\_at | TIMESTAMPTZ | When fully executed |
| created\_at | TIMESTAMPTZ | Created timestamp |
| updated\_at | TIMESTAMPTZ | Last updated |

## **13.3 TIC Versions (public.tic\_versions)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| tic\_id | UUID FK | TIC agreement reference |
| version | VARCHAR(20) | Version number (1.0, 1.1, 2.0) |
| status | VARCHAR(50) | draft, final, superseded |
| trigger | VARCHAR(50) | initial, change\_approved, attorney\_review, finalized |
| change\_request\_id | UUID FK | If triggered by change approval |
| snapshot | JSONB | Full TIC data at this version |
| notes | TEXT | Version notes |
| created\_by | UUID FK | User or system |
| created\_at | TIMESTAMPTZ | Created timestamp |

## **13.4 TIC Change Requests (public.tic\_change\_requests)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| tic\_id | UUID FK | TIC agreement reference |
| section\_key | VARCHAR(100) | Section being modified |
| change\_type | VARCHAR(50) | add, modify, remove |
| original\_text | TEXT | Original language (null for add) |
| proposed\_text | TEXT | Proposed new language |
| rationale | TEXT | Why change is proposed |
| ai\_generated | BOOLEAN | Was text generated by Homi |
| proposed\_by | UUID FK | User who proposed |
| status | VARCHAR(50) | pending, approved, rejected, expired |
| expires\_at | TIMESTAMPTZ | Voting deadline |
| resolved\_at | TIMESTAMPTZ | When resolved |
| created\_at | TIMESTAMPTZ | Created timestamp |

## **13.5 TIC Change Votes (public.tic\_change\_votes)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| change\_request\_id | UUID FK | Change request reference |
| user\_id | UUID FK | Voter |
| vote | VARCHAR(20) | approve, reject (null \= pending) |
| voted\_at | TIMESTAMPTZ | When voted |
| ip\_address | INET | Audit trail |

## **13.6 TIC Signatures (public.tic\_signatures)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| tic\_id | UUID FK | TIC agreement reference |
| user\_id | UUID FK | Signer (null for Tomi) |
| signer\_type | VARCHAR(50) | co\_owner, tomi\_rep |
| signer\_name | VARCHAR(255) | Legal name as signed |
| signed\_at | TIMESTAMPTZ | Signature timestamp |
| signature\_method | VARCHAR(50) | google\_docs, wet\_ink |
| ip\_address | INET | Audit trail |

# **14\. API Endpoints**

## **14.1 TIC Management**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/tic | Get TIC agreement status and current version |
| POST | /api/groups/:id/tic/generate | Generate initial TIC draft from resolutions |
| GET | /api/groups/:id/tic/sections | Get all sections with editability flags |
| GET | /api/groups/:id/tic/sections/:key | Get specific section details |
| GET | /api/groups/:id/tic/versions | List all versions |
| GET | /api/groups/:id/tic/export | Export PDF or DOCX |

## **14.2 Change Requests**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/tic/changes | List change requests |
| POST | /api/groups/:id/tic/changes | Create change request |
| GET | /api/groups/:id/tic/changes/:changeId | Get change request details |
| POST | /api/groups/:id/tic/changes/:changeId/vote | Cast vote on change |

## **14.3 Signing**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/tic/signatures | Get signature status for all parties |
| POST | /api/groups/:id/tic/finalize | Mark as final, initiate signing |
| POST | /api/groups/:id/tic/signed | Upload signed document (Tomi rep) |

## **14.4 Homi TIC Context**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/groups/:id/tic/homi/explain | Get plain-language explanation of section |
| POST | /api/groups/:id/tic/homi/what-if | Answer 'what if' scenario |
| POST | /api/groups/:id/tic/homi/draft | Generate language suggestion |

# **15\. Out of Scope (MVP)**

* Git-style diff view between versions (snapshots only)  
* Attorney comment import back into system  
* Automated notarization  
* Multi-property TIC agreements  
* Tomi-managed facilitation scheduling (manual for MVP)  
* AI-powered conflict detection (relies on exercises)

# **16\. Open Questions**

1. Should we allow partial signing (some sign while waiting for others) or require all to sign together?  
2. How to handle groups in states without templates? (Lean: use generic \+ strong attorney disclaimer)  
3. Should Homi be able to compare the group's TIC to 'standard' terms for benchmarking?

# **17\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| TIC generated from completed exercises | E2E test | Pass |
| Locked sections cannot be modified | Security test | Pass |
| Homi explains any section in plain language | Manual test | Pass |
| Homi explains why sections are locked | Manual test | Pass |
| 'What if' scenarios answered with disclaimers | Manual test | Pass |
| Language suggestions drafted with disclaimers | Manual test | Pass |
| Change requests require unanimous consent | E2E test | Pass |
| Single rejection kills change request | E2E test | Pass |
| PDF/DOCX export works correctly | Manual test | Pass |
| Google Docs e-signature integration works | Manual test | Pass |
| Signed TIC embedded in Homi RAG | Integration test | Pass |
| Version history tracked correctly | DB query | Pass |
| Attorney referral displayed for property state | Manual test | Pass |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

