# **PRD-008: Group Document Storage \+ Shared RAG**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 1 — Group Formation |
| **Dependencies** | PRD-004 (Personal Docs), PRD-005 (Groups) |

# **1\. Overview**

This PRD defines the group document storage system and shared RAG pipeline. It enables groups to store collective documents (TIC agreements, property records, closing docs) while allowing members to optionally share personal documents (financials, tax records) with the group on a time-limited basis. The group AI agent can reference both group-owned and shared personal documents to provide contextual assistance.

## **1.1 Purpose**

Create a unified document repository for co-buying groups that spans the entire lifecycle — from pre-purchase (financial verification, agreements) through home management (maintenance records, photos, receipts). Enable the group AI agent to provide contextual answers by referencing relevant documents while maintaining clear attribution of document sources.

## **1.2 Document Ownership Model**

Two Document Types, Two Storage Models:

┌─────────────────────────────────────────────────────────────────────┐  
│                     DOCUMENT OWNERSHIP MODEL                        │  
├─────────────────────────────────────────────────────────────────────┤  
│                                                                     │  
│  ┌─────────────────────────┐    ┌─────────────────────────┐        │  
│  │    PERSONAL DOCUMENTS   │    │     GROUP DOCUMENTS     │        │  
│  │      (PRD-004)          │    │       (PRD-008)         │        │  
│  ├─────────────────────────┤    ├─────────────────────────┤        │  
│  │ • Owned by individual   │    │ • Owned by group        │        │  
│  │ • Stored in user space  │    │ • Stored in group space │        │  
│  │ • Private by default    │    │ • Visible to all members│        │  
│  │ • Tax returns, pay stubs│    │ • TIC agreement, deeds  │        │  
│  │ • Credit reports        │    │ • Meeting notes, photos │        │  
│  └───────────┬─────────────┘    └─────────────────────────┘        │  
│              │                              ▲                       │  
│              │    ┌──────────────────┐      │                       │  
│              └───▶│  TEMPORARY SHARE │──────┘                       │  
│                   │  (30 days default)│                             │  
│                   │  Owner controls   │                             │  
│                   └──────────────────┘                              │  
│                                                                     │  
└─────────────────────────────────────────────────────────────────────┘

## **1.3 RAG Context Scope**

The group AI agent's RAG context includes:

* **Group documents:** All documents uploaded to the group  
* **Shared personal documents:** Personal docs explicitly shared with the group (while share is active)  
* **Source attribution:** Agent cites whether info came from "group docs" or "\[Member\]'s shared docs"  
* **Excluded:** Personal docs NOT shared with the group (respects privacy)

## **1.4 Success Criteria**

* Group document upload completes in under 5 seconds for files \<10MB  
* RAG retrieval includes both group and shared personal docs  
* Agent responses correctly attribute document sources  
* Personal doc shares auto-expire at configured duration  
* Zero unauthorized document access (RLS enforced)  
* TIC document versioning tracks all changes

# **2\. User Stories**

## **2.1 Group Document Management**

* **US-1:** As a group member, I want to upload documents to the group so everyone can access them.  
* **US-2:** As a group member, I want to categorize documents so they're organized and findable.  
* **US-3:** As a group admin, I want to restrict who can upload documents if needed.  
* **US-4:** As a document uploader, I want to delete my uploads. As an admin, I want to delete any document.

## **2.2 Personal Document Sharing**

* **US-5:** As a group member, I want to share my personal financial docs with the group for verification.  
* **US-6:** As a document owner, I want shares to expire automatically so I don't forget to revoke.  
* **US-7:** As a document owner, I want to revoke sharing early if needed.  
* **US-8:** As a group member, I want to see which personal docs have been shared for transparency.

## **2.3 AI Agent Context**

* **US-9:** As a group member, I want the AI to reference our group documents when answering questions.  
* **US-10:** As a group member, I want to know when the AI is citing group docs vs shared personal docs.  
* **US-11:** As a group, we want the AI to reference our TIC agreement when answering governance questions.

## **2.4 Lifecycle & Compliance**

* **US-12:** As a group admin, I want to see who has acknowledged the TIC agreement.  
* **US-13:** As a group admin, I want to see version history of the TIC agreement.  
* **US-14:** When a member leaves, I want to decide what happens to docs they uploaded.  
* **US-15:** When the group dissolves, I want to export documents before they're deleted.

# **3\. Document Categories**

Categories are extensible to support the full co-ownership lifecycle, from pre-purchase through ongoing home management.

## **3.1 Pre-Purchase Categories**

| Category | Example Documents | Icon |
| :---- | :---- | :---- |
| tic\_agreement | TIC agreement drafts, signed versions, amendments | 📜 |
| financial\_verification | Group financial summary, combined DTI analysis | 💰 |
| advisory\_agreement | Real estate advisory agreement, disclosures | 📋 |
| agent\_engagement | Buyer's agent agreement, broker engagement | 🤝 |
| credit\_reports | Group credit summary (anonymized or shared) | 📊 |
| preapproval | Group pre-approval letter, loan estimates | ✅ |
| meeting\_notes | Discussion summaries, decision records | 📝 |

## **3.2 Transaction Categories**

| Category | Example Documents | Icon |
| :---- | :---- | :---- |
| property\_listing | MLS listing, property details, photos | 🏠 |
| offer\_documents | Purchase offer, counter-offers, acceptance | 📄 |
| inspection | Home inspection report, pest inspection | 🔍 |
| appraisal | Appraisal report, comparable sales | 📈 |
| title | Title report, title insurance policy | 📑 |
| closing | Closing disclosure, settlement statement, deed | 🔑 |
| insurance | Homeowners insurance policy, declarations | 🛡️ |

## **3.3 Home Management Categories**

| Category | Example Documents | Icon |
| :---- | :---- | :---- |
| maintenance | Repair receipts, service contracts, warranties | 🔧 |
| property\_photos | Condition photos, improvement progress, damage | 📷 |
| utilities | Utility bills, account info, usage history | 💡 |
| hoa | HOA docs, meeting minutes, assessments | 🏢 |
| tax\_property | Property tax bills, assessment notices | 🏛️ |
| improvements | Renovation plans, permits, contractor agreements | 🏗️ |
| other | Miscellaneous documents | 📁 |

## **3.4 Category Extensibility**

* Categories stored in lookup table, not hardcoded enum  
* Admins can create custom categories for their group  
* System categories marked as is\_system \= true (cannot delete)  
* Categories can be assigned icons and colors

# **4\. Personal Document Sharing**

Members can share their personal documents (stored in their individual profile per PRD-004) with the group on a time-limited basis. This enables financial verification without permanently transferring ownership.

## **4.1 Sharing Model**

| Attribute | Behavior |
| :---- | :---- |
| Ownership | Document remains in owner's personal storage — no duplication |
| Access grant | Group members can view (not download by default) |
| Default duration | 30 days (configurable at share time) |
| Expiration | Access automatically revoked at expiry |
| Early revocation | Owner can revoke at any time |
| Renewal | Owner can extend share duration |
| RAG inclusion | Included in group agent context while share is active |

## **4.2 Share Flow**

User shares personal doc with group:

┌──────────────┐     ┌──────────────┐     ┌──────────────┐  
│  Personal    │     │   Create     │     │   Group      │  
│  Doc Library │────▶│   Share      │────▶│   Can View   │  
│              │     │   Record     │     │              │  
└──────────────┘     └──────────────┘     └──────────────┘  
       │                    │                    │  
       │                    ▼                    ▼  
       │              ┌──────────────┐    ┌──────────────┐  
       │              │  Set Expiry  │    │  RAG Index   │  
       │              │  (30 days)   │    │  Updated     │  
       │              └──────────────┘    └──────────────┘  
       │  
       ▼  
  Doc stays in personal storage (no copy)

## **4.3 Share Permissions**

| Permission | View-Only Share | Full Share | Notes |
| :---- | :---- | :---- | :---- |
| View in browser | ✓ | ✓ | Default for both |
| Download file | ✗ | ✓ | Owner chooses |
| Include in RAG | ✓ | ✓ | Both types |
| See extracted text | ✗ | ✓ | Privacy option |

*Default: View-only. Owner can upgrade to Full Share for verification purposes.*

# **5\. Group RAG Pipeline**

The group AI agent has access to a combined document context that includes group-owned documents and currently-shared personal documents.

## **5.1 RAG Architecture**

Group Agent Query Flow:

┌─────────────────────────────────────────────────────────────────────┐  
│                       GROUP AGENT RAG QUERY                         │  
├─────────────────────────────────────────────────────────────────────┤  
│                                                                     │  
│  User Query: "What does our TIC say about selling?"                │  
│                            │                                        │  
│                            ▼                                        │  
│                   ┌────────────────┐                                │  
│                   │  Embed Query   │                                │  
│                   └────────────────┘                                │  
│                            │                                        │  
│              ┌─────────────┴─────────────┐                          │  
│              ▼                           ▼                          │  
│    ┌──────────────────┐      ┌──────────────────┐                  │  
│    │   Group Docs     │      │  Shared Personal │                  │  
│    │   (group\_id \=X)  │      │  (active shares) │                  │  
│    └──────────────────┘      └──────────────────┘                  │  
│              │                           │                          │  
│              └─────────────┬─────────────┘                          │  
│                            ▼                                        │  
│                   ┌────────────────┐                                │  
│                   │ Merge & Rank   │                                │  
│                   │ by Similarity  │                                │  
│                   └────────────────┘                                │  
│                            │                                        │  
│                            ▼                                        │  
│                   ┌────────────────┐                                │  
│                   │ Return with    │                                │  
│                   │ Source Labels  │                                │  
│                   └────────────────┘                                │  
│                                                                     │  
└─────────────────────────────────────────────────────────────────────┘

## **5.2 Source Attribution**

Agent responses must clearly attribute document sources:

\<relevant\_documents\>

  \<document  
    name="TIC\_Agreement\_v3.pdf"  
    source="group"  
    category="tic\_agreement"\>  
    \[Page 12\] Section 6.2: Any owner wishing to sell their interest...  
  \</document\>  
  \<document  
    name="2023\_W2.pdf"  
    source="shared\_by:Alex"  
    category="income"  
    share\_expires="2024-02-15"\>  
    \[Page 1\] Total wages: $85,000.00...  
  \</document\>  
\</relevant\_documents\>

## **5.3 Combined Search Function**

\-- Supabase RPC function for group RAG

CREATE OR REPLACE FUNCTION match\_group\_document\_chunks(  
  query\_embedding VECTOR(1536),  
  p\_group\_id UUID,  
  match\_count INT DEFAULT 5,  
  filter\_categories TEXT\[\] DEFAULT NULL,  
  similarity\_threshold FLOAT DEFAULT 0.7  
)  
RETURNS TABLE (  
  id UUID,  
  content TEXT,  
  document\_id UUID,  
  document\_name TEXT,  
  category TEXT,  
  source\_type TEXT,  \-- "group" or "shared\_by:{user\_name}"  
  similarity FLOAT,  
  page\_number INT  
)  
LANGUAGE plpgsql AS $$  
BEGIN  
  RETURN QUERY  
  \-- Group documents  
  SELECT  
    dc.id, dc.content, dc.document\_id, d.name,  
    d.category, 'group'::TEXT as source\_type,  
    1 \- (dc.embedding \<=\> query\_embedding) as similarity,  
    dc.page\_number  
  FROM document\_chunks dc  
  JOIN documents d ON d.id \= dc.document\_id  
  WHERE d.group\_id \= p\_group\_id  
    AND (filter\_categories IS NULL OR d.category \= ANY(filter\_categories))  
    AND 1 \- (dc.embedding \<=\> query\_embedding) \> similarity\_threshold  
    
  UNION ALL  
    
  \-- Shared personal documents  
  SELECT  
    dc.id, dc.content, dc.document\_id, d.name,  
    d.category, 'shared\_by:' || u.display\_name as source\_type,  
    1 \- (dc.embedding \<=\> query\_embedding) as similarity,  
    dc.page\_number  
  FROM document\_chunks dc  
  JOIN documents d ON d.id \= dc.document\_id  
  JOIN document\_shares ds ON ds.document\_id \= d.id  
  JOIN users u ON u.id \= d.user\_id  
  WHERE ds.shared\_with\_group \= p\_group\_id  
    AND (ds.expires\_at IS NULL OR ds.expires\_at \> NOW())  
    AND (filter\_categories IS NULL OR d.category \= ANY(filter\_categories))  
    AND 1 \- (dc.embedding \<=\> query\_embedding) \> similarity\_threshold  
    
  ORDER BY similarity DESC  
  LIMIT match\_count;  
END;  
$$;

# **6\. TIC Agreement Handling**

The TIC agreement is the most critical document type and receives special handling: versioning, acknowledgment tracking, and change notifications.

## **6.1 Version Control**

* Each upload of TIC document creates new version (v1, v2, v3...)  
* Previous versions retained and accessible  
* Version notes required when uploading new version  
* Diff view shows changes between versions (future enhancement)  
* Only latest version included in RAG context

## **6.2 Acknowledgment Workflow**

When a new TIC version is uploaded, all members must acknowledge:

| Step | Action | System Response |
| :---- | :---- | :---- |
| 1 | Admin uploads new TIC version | Creates version record, notifies all members |
| 2 | Member opens TIC document | Tracks view timestamp |
| 3 | Member clicks 'Acknowledge' | Records acknowledgment with timestamp |
| 4 | Admin views acknowledgment status | Shows who has/hasn't acknowledged |
| 5 | All members acknowledged | Version marked as 'fully acknowledged' |

*Note: Acknowledgment is not legal signature — it indicates the member has reviewed the document.*

## **6.3 TIC Version Record**

tic\_version\_record: {

  "document\_id": "doc-123",  
  "version": 3,  
  "uploaded\_by": "user-456",  
  "uploaded\_at": "2024-12-15T10:00:00Z",  
  "version\_notes": "Updated exit provisions per attorney review",  
  "acknowledgments": \[  
    { "user\_id": "user-1", "acknowledged\_at": "2024-12-15T14:30:00Z" },  
    { "user\_id": "user-2", "acknowledged\_at": "2024-12-16T09:15:00Z" },  
    { "user\_id": "user-3", "acknowledged\_at": null }  // pending  
  \],  
  "fully\_acknowledged": false  
}

# **7\. Document Lifecycle**

## **7.1 When Member Leaves Group**

| Doc Type | Behavior | Decision By |
| :---- | :---- | :---- |
| Group docs uploaded by member | Admin decides: keep, archive, or delete | Admin (per-doc) |
| Shared personal docs | Shares automatically revoked | Automatic |
| Acknowledgments by member | Retained for audit trail | Automatic |

## **7.2 When Group Dissolves**

| Phase | Action | Duration |
| :---- | :---- | :---- |
| 1 | Group marked for dissolution | — |
| 2 | Export window: members can download all docs | 90 days |
| 3 | Reminder notifications sent | At 30, 14, 7 days |
| 4 | Documents and embeddings permanently deleted | After 90 days |
| 5 | Audit log retained | Per retention policy |

## **7.3 Share Expiration**

* Scheduled job checks for expired shares daily  
* Expired shares: access revoked, chunks removed from group RAG index  
* Owner notified 3 days before expiry (option to renew)  
* Group notified when share expires

# **8\. Functional Requirements**

## **8.1 Document Upload**

1. System shall allow any member to upload group documents (unless admin restricted)  
2. System shall allow admins to restrict upload permissions  
3. System shall require category selection on upload  
4. System shall process and index document for RAG  
5. System shall track uploader and upload timestamp  
6. System shall create new version for TIC documents

## **8.2 Document Access**

1. System shall allow all active group members to view group documents  
2. System shall generate signed URLs for secure download  
3. System shall allow uploaders and admins to delete documents  
4. System shall enforce RLS for all document access  
5. System shall log all document access events

## **8.3 Personal Document Sharing**

1. System shall allow personal doc owners to share with groups they belong to  
2. System shall default share duration to 30 days  
3. System shall automatically revoke expired shares  
4. System shall allow owners to revoke or extend shares  
5. System shall include shared docs in group RAG while active  
6. System shall notify on share creation, expiry warning, and revocation

## **8.4 Group RAG**

1. System shall search both group docs and active shared docs  
2. System shall return source attribution with each chunk  
3. System shall distinguish 'group' from 'shared\_by:{name}' sources  
4. System shall exclude expired shares from search  
5. System shall complete retrieval in under 500ms

## **8.5 Lifecycle Management**

1. System shall prompt admin for doc decision when member leaves  
2. System shall provide 90-day export window on group dissolution  
3. System shall send reminder notifications during export window  
4. System shall permanently delete docs after export window  
5. System shall retain audit logs per compliance requirements

# **9\. Data Model**

## **9.1 Documents Table Updates (public.documents)**

Extended from PRD-004 with group-specific fields:

| Column | Type | Description |
| :---- | :---- | :---- |
| group\_id | UUID FK | Group owner (null for personal docs) |
| is\_tic\_document | BOOLEAN | Flag for TIC agreement special handling |
| requires\_acknowledgment | BOOLEAN | Whether acknowledgment workflow applies |
| upload\_restricted | BOOLEAN | If true, only admins can upload to this group |

**Constraint:** Either user\_id OR group\_id must be set (not both)

## **9.2 Document Categories Table (public.document\_categories)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| slug | VARCHAR(100) | Unique identifier |
| name | VARCHAR(255) | Display name |
| description | TEXT | Category description |
| icon | VARCHAR(10) | Emoji or icon code |
| phase | VARCHAR(50) | pre\_purchase, transaction, management |
| is\_system | BOOLEAN | System category (cannot delete) |
| group\_id | UUID FK | Null for system, group\_id for custom |
| display\_order | INTEGER | Sort order |

## **9.3 Document Shares Table (public.document\_shares)**

Updated from PRD-004 with additional fields:

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| document\_id | UUID FK | Shared document |
| shared\_with\_group | UUID FK | Target group |
| shared\_by | UUID FK | Document owner who shared |
| permission | VARCHAR(50) | view\_only, full |
| expires\_at | TIMESTAMPTZ | Auto-revoke time |
| revoked\_at | TIMESTAMPTZ | If manually revoked |
| include\_in\_rag | BOOLEAN | Include in group RAG (default true) |
| created\_at | TIMESTAMPTZ | Share timestamp |

## **9.4 Document Versions Table (public.document\_versions)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| document\_id | UUID FK | Parent document |
| version | INTEGER | Version number |
| storage\_key | VARCHAR(500) | Storage path for this version |
| version\_notes | TEXT | Description of changes |
| uploaded\_by | UUID FK | Who uploaded this version |
| created\_at | TIMESTAMPTZ | Version timestamp |

## **9.5 Document Acknowledgments Table (public.document\_acknowledgments)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| document\_id | UUID FK | Document reference |
| version | INTEGER | Version acknowledged |
| user\_id | UUID FK | User who acknowledged |
| viewed\_at | TIMESTAMPTZ | When first viewed |
| acknowledged\_at | TIMESTAMPTZ | When acknowledged (null if pending) |
| ip\_address | INET | For audit purposes |

# **10\. API Endpoints**

## **10.1 Group Documents**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/documents | List group documents with filtering |
| POST | /api/groups/:id/documents | Upload document to group |
| GET | /api/groups/:id/documents/:docId | Get document metadata |
| GET | /api/groups/:id/documents/:docId/url | Get signed download URL |
| PATCH | /api/groups/:id/documents/:docId | Update metadata (name, category) |
| DELETE | /api/groups/:id/documents/:docId | Delete document |

## **10.2 Document Sharing**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/shared-documents | List docs shared with group |
| POST | /api/documents/:docId/share | Share personal doc with group |
| PATCH | /api/shares/:shareId | Extend or modify share |
| DELETE | /api/shares/:shareId | Revoke share early |
| GET | /api/documents/:docId/shares | List active shares for a doc |

## **10.3 TIC & Versioning**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/documents/:docId/versions | List all versions |
| GET | /api/groups/:id/documents/:docId/versions/:v | Get specific version |
| GET | /api/groups/:id/documents/:docId/acknowledgments | Get acknowledgment status |
| POST | /api/groups/:id/documents/:docId/acknowledge | Acknowledge current version |

## **10.4 Group RAG**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/groups/:id/rag/query | Query group \+ shared docs |
| GET | /api/groups/:id/rag/sources | List all RAG-indexed sources |

## **10.5 Categories**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/groups/:id/categories | List system \+ custom categories |
| POST | /api/groups/:id/categories | Create custom category (admin) |
| DELETE | /api/groups/:id/categories/:catId | Delete custom category (admin) |

# **11\. UI/UX Requirements**

## **11.1 Group Document Library**

* **Category tabs/filter:** Filter by category, phase, or show all  
* **Document cards:** Name, category icon, uploader, date, status badge  
* **Shared section:** Separate section for 'Shared by members' with expiry dates  
* **Upload button:** Prominent CTA, drag-drop zone  
* **Search:** Search by document name

## **11.2 Upload Flow**

* **Step 1:** Select file(s) or drag-drop  
* **Step 2:** Select category (required)  
* **Step 3:** For TIC docs: add version notes  
* **Step 4:** Upload progress indicator  
* **Step 5:** Success confirmation, processing status

## **11.3 Share Personal Document Modal**

* **Document preview:** Thumbnail and name  
* **Target group:** Dropdown of groups user belongs to  
* **Duration:** Preset options (7d, 30d, 90d) or custom date  
* **Permission:** Toggle for 'Allow download'  
* **Confirmation:** "Members of \[Group\] will be able to view this until \[Date\]"

## **11.4 TIC Acknowledgment View**

* **Document viewer:** Embedded PDF viewer  
* **Version badge:** "Version 3 \- Uploaded Dec 15, 2024"  
* **Version notes:** Collapsible section showing what changed  
* **Acknowledge button:** Prominent CTA after scrolling/viewing  
* **Status panel:** Shows who has/hasn't acknowledged  
* **Version history:** Link to view previous versions

# **12\. n8n Webhook Integration**

| Event | Trigger | Notification |
| :---- | :---- | :---- |
| document.uploaded | New group document uploaded | Notify group members |
| tic.version\_uploaded | New TIC version uploaded | Notify all, request acknowledgment |
| tic.fully\_acknowledged | All members acknowledged | Notify admin |
| share.created | Personal doc shared | Notify group members |
| share.expiring\_soon | 3 days before expiry | Notify owner (renew option) |
| share.expired | Share expired | Notify owner and group |
| group.dissolving | Export window started | Notify all members |
| group.export\_reminder | 30, 14, 7 days remaining | Remind to export docs |

# **13\. Out of Scope (MVP)**

* Partner (attorney, lender) direct upload portal  
* Document diff view between TIC versions  
* E-signature integration (DocuSign, etc.)  
* Document templates library  
* OCR auto-categorization  
* Collaborative document editing

# **14\. Open Questions**

1. Should we allow anonymous document viewing (no tracking) for sensitive docs?  
2. Maximum file size for group documents? (Lean: same as personal, 25MB)  
3. Should shared doc expiry be extendable by group admin, or only owner?

# **15\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| Member can upload document to group | Manual test | Pass |
| All members can view group documents | Manual test | Pass |
| Admin can restrict upload permissions | Manual test | Pass |
| Personal doc can be shared with group | Manual test | Pass |
| Share expires automatically at duration | E2E test | Pass |
| Group RAG includes both group and shared docs | Integration test | Pass |
| RAG response attributes source correctly | Manual test | Pass |
| TIC upload creates new version | Manual test | Pass |
| Acknowledgment workflow functions correctly | E2E test | Pass |
| Member leaving: admin can decide doc fate | Manual test | Pass |
| Group dissolution: 90-day export window | Manual test | Pass |
| RLS prevents unauthorized access | Security test | Pass |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

