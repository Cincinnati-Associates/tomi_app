# **PRD-012: Property Association**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Date** | January 2025 |
| **Dependencies** | PRD-005 (Groups), PRD-008 (Documents), PRD-009 (TIC), PRD-010 (Calculator) |

# **1\. Overview**

Property Association enables groups to track properties through the entire co-buying lifecycle—from initial discovery through purchase and beyond. Groups can browse multiple candidates, designate an active property, and link financial scenarios, documents, and TIC agreements to specific properties.

## **1.1 Lifecycle Stages**

| Status | Description | Triggers |
| :---- | :---- | :---- |
| browsing | Initial discovery, evaluating | Property added to group |
| touring | Scheduling/completing showings | Member marks as touring |
| offer\_pending | Offer submitted, awaiting response | Member marks offer submitted |
| under\_contract | Offer accepted, in escrow | Member marks under contract |
| closed | Purchase complete | Tomi admin only |
| not\_selected | Archived/rejected | Member archives property |

## **1.2 Key Principles**

* Multiple candidates: Groups can track many properties simultaneously  
* One active property: Only one property designated as 'active' at a time (under\_contract or closed)  
* Any member adds: All group members can add properties  
* Admin closes: Only Tomi admin can mark property as 'closed' (prevents premature status)  
* History preserved: Archived properties retained for learning/audit

# **2\. Property Data**

## **2.1 Data Sources**

Property data can be populated via two methods:

**URL Parsing (Primary):** User pastes Zillow/Redfin/Realtor URL → OpenAI extracts address → Datafiniti fetches property data  
**Manual Entry (Fallback):** User manually enters address and property details when URL parsing fails or for off-market properties

## **2.2 Existing Integration (Repurpose)**

Leverage existing tomi-app services:

| File | Function |
| :---- | :---- |
| services/openai.js | formatHomeAddress(url) → parses URL to {address, city, state, zipcode} |
| services/datafiniti.js | propertiesSearch(addressObj) → fetches property by address |
| services/datafiniti.js | getPropertyById(id) → fetches property by Datafiniti ID |
| utils/extractPropertyInfo.js | Normalizes Datafiniti response to standard schema |
| utils/validateListingUrl.js | Validates Zillow/Redfin/Realtor URLs |

## **2.3 Property Fields**

| Field | Type | Source | Notes |
| :---- | :---- | :---- | :---- |
| address | VARCHAR | Datafiniti/Manual | Street address |
| city | VARCHAR | Datafiniti/Manual | City name |
| state | VARCHAR(2) | Datafiniti/Manual | State code |
| postal\_code | VARCHAR(10) | Datafiniti/Manual | ZIP code |
| list\_price | INTEGER | Datafiniti/Manual | Current/last list price |
| bedrooms | INTEGER | Datafiniti/Manual | Number of bedrooms |
| bathrooms | DECIMAL | Datafiniti/Manual | Number of bathrooms |
| sqft | INTEGER | Datafiniti/Manual | Living area sq ft |
| lot\_size | DECIMAL | Datafiniti/Manual | Lot size (acres) |
| property\_type | VARCHAR | Datafiniti/Manual | SFH, Condo, Townhouse, etc. |
| year\_built | INTEGER | Datafiniti/Manual | Year constructed |
| hoa\_monthly | INTEGER | Datafiniti/Manual | Monthly HOA fees |
| property\_tax\_annual | INTEGER | Datafiniti/Manual | Annual property taxes |
| listing\_url | TEXT | User input | Original listing URL |
| primary\_image\_url | TEXT | Datafiniti | Main property photo (external) |
| image\_urls | JSONB | Datafiniti | Array of photo URLs |
| datafiniti\_id | VARCHAR | Datafiniti | External ID for refresh |
| mls\_number | VARCHAR | Datafiniti | MLS listing number |
| description | TEXT | Datafiniti | Property description |

# **3\. Data Model**

## **3.1 Properties (public.properties)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| group\_id | UUID FK | Owning group (required) |
| added\_by | UUID FK | User who added property |
| status | VARCHAR(20) | browsing, touring, offer\_pending, under\_contract, closed, not\_selected |
| is\_active | BOOLEAN | True if this is group's active property (only one per group) |
| address | VARCHAR(255) | Street address |
| city | VARCHAR(100) | City |
| state | VARCHAR(2) | State code |
| postal\_code | VARCHAR(10) | ZIP code |
| list\_price | INTEGER | Listing price |
| bedrooms | INTEGER | Bedroom count |
| bathrooms | DECIMAL(3,1) | Bathroom count |
| sqft | INTEGER | Square footage |
| lot\_size | DECIMAL(10,4) | Lot size in acres |
| property\_type | VARCHAR(50) | SFH, Condo, Townhouse, Multi-Family |
| year\_built | INTEGER | Year built |
| hoa\_monthly | INTEGER | Monthly HOA fees |
| property\_tax\_annual | INTEGER | Annual property tax |
| listing\_url | TEXT | Original listing URL |
| primary\_image\_url | TEXT | Main photo URL (external link) |
| image\_urls | JSONB | Array of photo URLs |
| datafiniti\_id | VARCHAR(100) | Datafiniti property ID for refresh |
| mls\_number | VARCHAR(50) | MLS number |
| description | TEXT | Property description |
| raw\_data | JSONB | Full Datafiniti response (for future fields) |
| notes | TEXT | Group notes about property |
| created\_at | TIMESTAMPTZ | When added |
| updated\_at | TIMESTAMPTZ | Last updated |

## **3.2 Property Status History (public.property\_status\_history)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| property\_id | UUID FK | Property reference |
| from\_status | VARCHAR(20) | Previous status (null for initial) |
| to\_status | VARCHAR(20) | New status |
| changed\_by | UUID FK | User who changed status |
| notes | TEXT | Reason/context for change |
| created\_at | TIMESTAMPTZ | When changed |

## **3.3 Property Closing Details (public.property\_closings)**

Manually entered when property closes:

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| property\_id | UUID FK UNIQUE | One-to-one with property |
| closing\_date | DATE | Actual closing date |
| final\_price | INTEGER | Final purchase price |
| title\_company | VARCHAR(200) | Title company name |
| escrow\_number | VARCHAR(100) | Escrow/file number |
| lender\_name | VARCHAR(200) | Mortgage lender |
| loan\_amount | INTEGER | Final loan amount |
| interest\_rate | DECIMAL(5,3) | Final interest rate |
| loan\_term\_years | INTEGER | Loan term |
| notes | TEXT | Additional closing notes |
| entered\_by | UUID FK | Tomi admin who entered |
| created\_at | TIMESTAMPTZ | When entered |
| updated\_at | TIMESTAMPTZ | Last updated |

# **4\. Integration Points**

## **4.1 Calculator Integration (PRD-010)**

Property data auto-populates calculator inputs:

| Property Field | Calculator Field | Notes |
| :---- | :---- | :---- |
| list\_price | home\_price | Pre-populates home value |
| hoa\_monthly | recurrent\_expenses | Added to monthly costs |
| property\_tax\_annual | property\_taxes | Divided by 12 for monthly |
| bedrooms | num\_bedroom | Suggests co-owner count |

Calculator sessions linked to properties via calculator\_sessions.property\_id FK.

## **4.2 TIC Agreement Integration (PRD-009)**

* Property address auto-populates TIC recitals and property description sections  
* TIC not required until property selected, but recommended when under\_contract  
* tic\_agreements.property\_id FK links agreement to property

## **4.3 Document Storage Integration (PRD-008)**

Folder structure:

/groups/{group\_id}/  /shared/              ← Group-level docs (TIC, group agreements)  /properties/    /{property\_id}/     ← Property-specific docs      /disclosures/      /inspections/      /appraisals/      /title/      /closing/

* Property documents linked via grp\_documents.property\_id FK  
* Group-level documents (property\_id \= null) accessible across all properties

# **5\. API Endpoints**

## **5.1 Properties**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/groups/:groupId/properties | Add property (URL or manual) |
| GET | /api/groups/:groupId/properties | List group's properties |
| GET | /api/groups/:groupId/properties/:id | Get property details |
| PUT | /api/groups/:groupId/properties/:id | Update property |
| PUT | /api/groups/:groupId/properties/:id/status | Change property status |
| PUT | /api/groups/:groupId/properties/:id/active | Set as active property |
| POST | /api/groups/:groupId/properties/:id/refresh | Refresh data from Datafiniti |
| DELETE | /api/groups/:groupId/properties/:id | Archive property (soft delete) |

## **5.2 Property Lookup**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/properties/lookup | Parse URL or address, return property data |
| POST | /api/properties/parse-url | Extract address from listing URL |

## **5.3 Closing Details (Admin)**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/admin/properties/:id/close | Mark property closed \+ enter closing details |
| PUT | /api/admin/properties/:id/closing | Update closing details |
| GET | /api/admin/properties/:id/closing | Get closing details |

## **5.4 Calculator Integration**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/groups/:groupId/properties/:id/calculator | Create calculator session from property |
| GET | /api/groups/:groupId/properties/:id/scenarios | Get calculator scenarios for property |

# **6\. URL Parsing Flow**

Sequence when user pastes a listing URL:

1. User pastes URL (Zillow, Redfin, Realtor, etc.)  
2. validateListingUrl() validates URL format and source  
3. formatHomeAddress(url) sends to OpenAI → returns {address, city, state, zipcode}  
4. propertiesSearch(addressObj) queries Datafiniti by address  
5. extractPropertyInfo(data) normalizes response to standard schema  
6. Property data displayed for user confirmation  
7. On confirm, property saved to group

## **6.1 Fallback Handling**

* If URL parsing fails: Show manual entry form  
* If Datafiniti returns no match: Allow user to enter address manually and retry  
* If Datafiniti match uncertain: Show results and let user confirm correct property

# **7\. Notifications**

| Event | Recipients | Channel |
| :---- | :---- | :---- |
| Property added | All group members | In-app, email, push |
| Status → touring | All group members | In-app, push |
| Status → offer\_pending | All group members | In-app, email, push |
| Status → under\_contract | All group members | In-app, email, push |
| Status → closed | All group members | In-app, email, push |
| Property archived | All group members | In-app |

# **8\. UI Requirements**

## **8.1 Add Property Modal**

* URL input field with paste detection (primary)  
* 'Enter manually' toggle for fallback  
* Loading state while parsing/fetching  
* Property preview card for confirmation before save  
* Error states with retry/manual entry options

## **8.2 Property List View**

* Card grid showing all group properties  
* Status badge on each card (color-coded)  
* 'Active' indicator for designated property  
* Quick actions: View details, Change status, Set as active  
* Filter/sort by status, date added, price

## **8.3 Property Detail View**

Tabs: Overview | Calculator | Documents | Notes | History

# **9\. Acceptance Criteria**

| \# | Criterion | Method |
| :---- | :---- | :---- |
| 1 | User can paste Zillow/Redfin/Realtor URL and property data auto-populates | E2E test |
| 2 | User can manually enter property when URL parsing fails | E2E test |
| 3 | Any group member can add properties | Unit test |
| 4 | Property status changes notify all group members | Integration test |
| 5 | Only Tomi admin can mark property as 'closed' | Unit test |
| 6 | Only one property per group can be 'active' | DB constraint test |
| 7 | Property data populates calculator with correct values | Integration test |
| 8 | Property address populates TIC agreement sections | Integration test |
| 9 | Documents can be linked to specific properties | Integration test |
| 10 | Archived properties retained but hidden from default view | E2E test |
| 11 | Property status history tracked with timestamps and users | Audit test |
| 12 | Closing details can be entered and updated by admin | E2E test |

# **10\. Out of Scope — MVP**

| Feature | Target Phase |
| :---- | :---- |
| Multi-property side-by-side comparison | Phase 2 |
| Offer tracking (amount, date, counter-offers) | Phase 2 |
| Real-time MLS status sync | Phase 3 |
| Property valuation estimates (Zestimate-like) | Phase 3 |
| Neighborhood data/scores | Phase 3 |
| Photo uploads (vs external links) | Phase 2 |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | January 2025 | Initial specification |

