# **PRD-010: Financial Scenario Modeling**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 1 — Pre-Purchase & Marketing |
| **Dependencies** | PRD-003 (Exercise Framework), PRD-007 (Group Exercises) |

# **1\. Overview**

This PRD defines Tomi's Financial Scenario Modeling system — a three-tier calculator architecture that helps users understand co-ownership economics from initial curiosity through detailed financial planning. The system models unequal ownership splits, tax implications, exit scenarios, and enables viral sharing through encoded URL parameters.

## **1.1 Purpose**

Transform abstract co-ownership concepts into concrete, personalized financial projections. Show users exactly what they can afford, how costs split across unequal contributions, what happens at various exit points, and how co-ownership compares to solo buying or renting.

## **1.2 Strategic Context**

* **Marketing funnel entry:** Simple calculator captures leads and drives platform signups  
* **Affordability discovery:** Reverse-calculate from income to max home price  
* **Group alignment:** Model different contribution scenarios before committing  
* **Decision support:** Project ownership percentages, exit proceeds, tax implications  
* **Viral distribution:** Shareable URLs let users invite co-buyers with pre-populated scenarios

## **1.3 Reference Design**

The existing Home Co-Ownership Calculator prototype serves as the reference design. Key patterns to preserve: Bottoms-Up / Top-Down toggle, named co-owner inputs, donut chart ownership visualization, Sales Scenarios table, Exit & Payout Analysis with per-person breakdowns, and tax strategy selectors.

# **2\. Three-Tier Architecture**

The calculator system is organized into three tiers, each building on the previous with increasing sophistication and requiring different levels of user investment.

Calculator Tiers:

┌─────────────────────────────────────────────────────────────────────────┐  
│                     CALCULATOR TIER ARCHITECTURE                        │  
├─────────────────────────────────────────────────────────────────────────┤  
│                                                                         │  
│  TIER 1: LANDING PAGE              TIER 2: AFFORDABILITY               │  
│  ─────────────────────             ──────────────────────               │  
│  Context: Marketing site           Context: Pre-signup/early journey   │  
│  Auth: None required               Auth: Optional (saves to profile)   │  
│                                                                         │  
│  • Home price slider               • All Tier 1 inputs                 │  
│  • Down payment %                  • Bottoms-Up / Top-Down toggle      │  
│  • Interest rate                   • Named co-owners (add/remove)      │  
│  • \# Co-owners (equal split)       • Per-person: down pmt \+ monthly    │  
│  • Monthly payment / person        • Income per person                 │  
│  • Savings vs. solo owner          • DTI calculation                   │  
│  • Shareable URL                   • Qualification indicator           │  
│  • CTA to deeper tools             • Max home price (reverse calc)     │  
│                                    • Ownership % donut chart           │  
│                                    • Solo-buy mode toggle              │  
│                                                                         │  
│  TIER 3: ADVANCED (AUTHENTICATED)                                      │  
│  ────────────────────────────────                                      │  
│  Context: Active groups, serious planning                              │  
│  Auth: Required                                                        │  
│                                                                         │  
│  • All Tier 1 & 2 inputs                                               │  
│  • Sales Scenarios table (multiple time horizons)                      │  
│  • Exit & Payout Analysis per scenario                                 │  
│  • Per-person breakdown: contribution, proceeds, P/L, ROI              │  
│  • Tax strategy selector (None, Section 121, 1031 Exchange)            │  
│  • Mortgage interest \+ property tax deductions                         │  
│  • Tomi 1% impact visualization                                        │  
│  • Rent vs. co-own comparison (long-duration scenarios)                │  
│  • Pre-populate from Financial Contribution exercise                   │  
│  • Export to PDF / share with group                                    │  
│  • "Convert to Legal Doc" → TIC Builder flow                           │  
│                                                                         │  
└─────────────────────────────────────────────────────────────────────────┘

## **2.1 Tier 1: Landing Page Calculator**

Embedded on marketing site. Zero friction, maximum shareability.

| Attribute | Specification |
| :---- | :---- |
| Auth Required | No |
| Input Mode | Equal splits only (single \# of co-owners) |
| Calculations | Monthly P\&I per person, savings vs. solo, basic affordability |
| Output | Monthly payment, savings amount, shareable URL |
| CTA | "See detailed breakdown" → Tier 2, "Share with friends" → URL |
| Lead Capture | Optional email gate before sharing |

## **2.2 Tier 2: Affordability Calculator**

The Bottoms-Up / Top-Down calculator from the reference design.

| Attribute | Specification |
| :---- | :---- |
| Auth Required | Optional (saves to profile if logged in) |
| Input Modes | Bottoms-Up (per-person budgets → max price) OR Top-Down (price → per-person costs) |
| Co-owner Management | Named co-owners, add/remove, individual down payment \+ monthly budget |
| Calculations | Max home price, max loan, ownership %, DTI qualification |
| Outputs | Calculated Affordability panel, ownership donut chart, Est. Available Nights |
| Comparison | Solo-buy mode toggle (aggregate all costs to one person) |

### **Bottoms-Up Mode**

* Users input what each person CAN contribute (down payment \+ monthly)  
* System calculates: Total budget → Max home price → Max loan amount  
* Shows what's affordable given the group's collective capacity

### **Top-Down Mode**

* Users input target home price  
* System shows required contribution per person at various split levels  
* Users adjust splits to find workable allocation

## **2.3 Tier 3: Advanced Financial Modeling**

The Sales Scenarios and Exit & Payout Analysis from the reference design.

| Attribute | Specification |
| :---- | :---- |
| Auth Required | Yes |
| Context | Active group or serious individual planning |
| Scenario Builder | Add scenarios: period (months), appreciation %, est. future value |
| Scenario Table | Timeline, appreciation, future value, remaining mortgage, total equity, per-person breakdown |
| Exit Analysis | Sale price, loan balance, selling costs %, gross equity, net proceeds |
| Per-Person Cards | Ownership %, total contribution, net proceeds, P/L, ROI, annualized ROI, tax strategy, taxable gain |
| Tax Strategies | None, Section 121 ($250k exclusion), 1031 Exchange |
| Integration | "Convert to Legal Doc" → TIC Builder (PRD-009) |

# **3\. Core Calculations**

Mathematical foundations for all calculator tiers.

## **3.1 Monthly Payment (P\&I)**

Standard amortization formula:

M \= P × \[r(1+r)^n\] / \[(1+r)^n \- 1\]

Where:  
  M \= Monthly payment  
  P \= Loan principal (home price \- down payment)  
  r \= Monthly interest rate (annual rate / 12\)  
  n \= Total payments (loan term in years × 12\)

## **3.2 Ownership Percentage Calculation**

Based on full-term contributions:

Total Contribution \= Down Payment \+ (Monthly Payment × Loan Term Months)

Ownership % \= (Person's Total Contribution / Sum of All Contributions) × 100

Example (30-year term):  
  Cody:  $50,000 down \+ ($1,250 × 360\) \= $500,000 total → 32.9%  
  Tony:  $25,000 down \+ ($2,000 × 360\) \= $745,000 total → 49.0%  
  Mony:  $85,000 down \+ ($500 × 360\)   \= $265,000 total → 17.4%  
  Note: Tomi's 1% comes from appreciation, not shown in contribution calc

## **3.3 DTI (Debt-to-Income) Calculation**

Backend DTI for qualification:

DTI \= (Monthly Housing Costs \+ Other Debts) / Gross Monthly Income × 100

Thresholds by property type:  
  Primary Residence:   43% max (conventional), 50% (FHA)  
  Secondary/Vacation:  36% max  
  Investment Property: 36% max

Qualification Indicator:  
  GREEN:  DTI \< threshold \- 5%  
  YELLOW: DTI within 5% of threshold  
  RED:    DTI \> threshold

## **3.4 Max Home Price (Reverse Calculation)**

From monthly budget to max price:

1\. Calculate max monthly payment from DTI:  
   Max Monthly \= (Gross Income × DTI Threshold) \- Other Debts

2\. Reverse amortization to get max loan:  
   Max Loan \= Max Monthly × \[(1+r)^n \- 1\] / \[r(1+r)^n\]

3\. Add down payment:  
   Max Home Price \= Max Loan \+ Total Down Payment

## **3.5 Equity & Exit Calculations**

For exit scenario analysis:

Future Value \= Home Price × (1 \+ Annual Appreciation)^Years

Remaining Mortgage \= calculate\_remaining\_balance(principal, rate, term, months\_paid)

Total Gross Equity \= Future Value \- Remaining Mortgage

Est. Selling Costs \= Future Value × Selling Cost % (default 6%)

Net Distributable Proceeds \= Total Gross Equity \- Est. Selling Costs

Tomi's Share \= Net Distributable Proceeds × 1%

Per-Person Net Proceeds \= (Net Distributable \- Tomi Share) × Ownership %

## **3.6 ROI Calculations**

Return metrics:

Total Contribution \= Down Payment \+ (Monthly Payment × Months Held)

Profit/Loss \= Net Proceeds \- Total Contribution

Total ROI \= (Profit/Loss / Total Contribution) × 100

Annualized ROI \= ((1 \+ Total ROI)^(12/Months Held) \- 1\) × 100

# **4\. Tax Modeling**

Simple tax estimates with clear disclaimers. Not tax advice.

## **4.1 Ongoing Tax Benefits**

Mortgage interest and property tax deductions per co-owner:

| Deduction | Calculation | Notes |
| :---- | :---- | :---- |
| Mortgage Interest | Interest portion × Ownership % | Deductible for primary/secondary |
| Property Tax | Annual tax × Ownership % | $10K SALT cap may apply |
| Est. Tax Savings | Total deductions × Marginal Rate | Simplified estimate |

## **4.2 Exit Tax Strategies**

| Strategy | Description | Requirements |
| :---- | :---- | :---- |
| None | Full capital gains tax on profit | — |
| Section 121 Exclusion | Each qualifying co-owner excludes up to $250K gain ($500K married) | 2+ years primary residence in last 5 years |
| 1031 Exchange | Defer capital gains by reinvesting in like-kind property | Investment property, 45/180 day rules |

### **Section 121 Note**

Each co-owner who qualifies can claim their own $250K exclusion independently. This is a significant advantage of co-ownership — three qualifying co-owners could exclude up to $750K in combined gains.

## **4.3 Tax Disclaimers**

Required disclaimers shown contextually:

* "These are simplified estimates. Consult a CPA or tax professional for advice specific to your situation."  
* "Section 121 exclusion requires meeting ownership and use tests. Requirements may vary."  
* "1031 exchanges have strict timelines and rules. Professional guidance required."  
* "SALT deduction cap ($10K) may limit property tax benefits."

# **5\. Shareable URLs**

Dynamic URL encoding enables viral distribution and pre-populated invitations.

## **5.1 URL Parameter Schema**

Tier 1 (Simple):

https://tomi.homes/calc?hp=650000\&dp=20\&ir=6.5\&co=3

Parameters:  
  hp \= Home price  
  dp \= Down payment %  
  ir \= Interest rate  
  co \= Number of co-owners

Tier 2 (Detailed):

https://tomi.homes/calc?mode=bu\&owners=Cody:50000:1250,Tony:25000:2000,Mony:85000:500\&ir=6.5\&term=30

Parameters:  
  mode \= bu (bottoms-up) | td (top-down)  
  owners \= name:downpmt:monthly (comma-separated)  
  ir \= Interest rate  
  term \= Loan term years  
  hp \= Home price (for top-down mode)

## **5.2 Share Flow**

* User configures calculator → clicks "Share"  
* System encodes current state into URL parameters  
* Optional: Email gate captures sharer's email before generating link  
* User copies link or shares directly via native share sheet  
* Recipient opens link → calculator pre-populated with sender's scenario  
* Recipient can modify and re-share with their own adjustments

## **5.3 OG Image Generation**

Dynamic Open Graph images for social sharing show key metrics: home price, number of co-owners, monthly payment per person, potential savings.

# **6\. Exercise Integration**

The Financial Contribution exercise (grp\_financial\_contribution) feeds into the Tier 3 calculator.

## **6.1 Data Flow**

Exercise → Calculator:

┌─────────────────────────┐     ┌─────────────────────────┐  
│  Financial Contribution │     │   Advanced Calculator   │  
│       Exercise          │────▶│      (Tier 3\)           │  
└─────────────────────────┘     └─────────────────────────┘

Mapped Fields:  
  exercise.down\_payment\_available → calculator.down\_payment  
  exercise.monthly\_budget        → calculator.monthly\_payment  
  exercise.annual\_income         → calculator.income (for DTI)  
  exercise.existing\_debts        → calculator.other\_debts  
  user.profile.name              → calculator.co\_owner\_name

## **6.2 Group Context**

When calculator is accessed within a group context:

* Auto-populate all members who completed Financial Contribution exercise  
* Members without completed exercise shown with empty inputs  
* Manual inputs allowed (not everyone needs to complete exercise first)  
* Changes in calculator do NOT update exercise responses (one-way flow)

# **7\. Comparison Modes**

## **7.1 Solo-Buy Mode**

Toggle that aggregates all costs to a single person:

* Sum all down payments → single person's down payment  
* Sum all monthly budgets → single person's monthly budget  
* Show resulting max home price and monthly payment  
* Compare: "Together you can afford $X; alone you'd need to spend $Y/month for the same home"

## **7.2 Rent vs. Co-Own Comparison**

Shown within Exit & Payout Analysis for longer scenarios (60+ months):

* User inputs current rent amount  
* System shows total rent paid over scenario period  
* Compare to: total housing costs \+ equity built  
* Show net wealth difference: "After 10 years, co-owning could put you $X ahead vs. renting"

# **8\. User Interface**

## **8.1 Tier 2 Layout (Reference: Existing Prototype)**

| Left Panel: Contributor Budgets | Right Panel: Calculated Affordability |
| :---- | :---- |
| Mode toggle: Bottoms-Up / Top-Down | Interest rate input \+ "Get Today's Rate" button |
| Summary: Total Monthly Budget, Total Cash Down | Loan term selector (5-50 years) |
| Co-owner cards (name, down pmt, est. monthly) | Max Home Price (calculated) |
| "Add" button for new co-owners | Max Loan Amount (calculated) |
| Delete icon per co-owner card | Number of Bedrooms input |
| — | Full Term Ownership Estimate (donut chart) |

## **8.2 Tier 3 Layout (Reference: Sales Scenarios)**

| Sales Scenarios Section | Exit & Payout Analysis Section |
| :---- | :---- |
| Scenario inputs: Period, Appreciation %, Est. Future Value | Triggered by clicking a scenario row |
| "Add Scenario" button | Future Sale Price, Loan Balance, Selling Costs % |
| Scenario table with all metrics | Total Gross Equity, Est. Selling Costs, Net Distributable |
| Per-person columns: Own % / Equity $ | Per-person cards with full breakdown |
| Delete scenario action | Tax Strategy dropdown per person |
| — | "Convert to Legal Doc" CTA |

## **8.3 Donut Chart Visualization**

* Color-coded segments per co-owner  
* Center shows total or key metric  
* Legend shows: Name, Ownership %, "365 nights" (full access)  
* Hover/tap for detailed breakdown

# **9\. Data Model**

## **9.1 Calculator Sessions (public.calculator\_sessions)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| user\_id | UUID FK | Optional user reference |
| group\_id | UUID FK | Optional group reference |
| tier | INTEGER | 1, 2, or 3 |
| mode | VARCHAR(20) | bottoms\_up, top\_down |
| inputs | JSONB | All calculator inputs |
| outputs | JSONB | Calculated results |
| share\_token | VARCHAR(100) | Unique token for sharing |
| created\_at | TIMESTAMPTZ | Created timestamp |
| updated\_at | TIMESTAMPTZ | Last updated |

## **9.2 Calculator Contributors (public.calculator\_contributors)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| session\_id | UUID FK | Calculator session reference |
| user\_id | UUID FK | Optional linked user |
| name | VARCHAR(100) | Display name |
| down\_payment | DECIMAL(12,2) | Down payment amount |
| monthly\_budget | DECIMAL(10,2) | Monthly budget amount |
| annual\_income | DECIMAL(12,2) | For DTI calculation |
| other\_debts | DECIMAL(10,2) | Monthly debt payments |
| ownership\_pct | DECIMAL(5,2) | Calculated ownership % |
| display\_order | INTEGER | Order in UI |

## **9.3 Calculator Scenarios (public.calculator\_scenarios)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| session\_id | UUID FK | Calculator session reference |
| period\_months | INTEGER | Holding period in months |
| appreciation\_pct | DECIMAL(5,2) | Annual appreciation rate |
| est\_future\_value | DECIMAL(12,2) | Estimated future value |
| selling\_costs\_pct | DECIMAL(4,2) | Selling costs % (default 6\) |
| calculated\_results | JSONB | All calculated outputs |
| display\_order | INTEGER | Order in table |

## **9.4 Scenario Tax Strategies (public.scenario\_tax\_strategies)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| scenario\_id | UUID FK | Scenario reference |
| contributor\_id | UUID FK | Contributor reference |
| strategy | VARCHAR(50) | none, section\_121, exchange\_1031 |
| taxable\_gain | DECIMAL(12,2) | Estimated taxable gain after strategy |

# **10\. Calculation Library**

Shared calculation functions extracted from existing hooks into a clean, testable library.

## **10.1 Library Structure**

src/lib/calculations/:

calculations/  
├── mortgage.ts          \# P\&I, amortization, remaining balance  
├── ownership.ts         \# Ownership % from contributions  
├── affordability.ts     \# DTI, max home price, qualification  
├── equity.ts            \# Future value, exit proceeds, ROI  
├── tax.ts               \# Deductions, Section 121, 1031  
├── comparison.ts        \# Solo-buy, rent vs own  
├── sharing.ts           \# URL encoding/decoding  
└── index.ts             \# Barrel export

## **10.2 Key Functions**

| Function | Inputs | Outputs |
| :---- | :---- | :---- |
| calculateMonthlyPayment() | principal, rate, termYears | Monthly P\&I amount |
| calculateOwnershipPct() | contributors\[\], termMonths | Ownership % per person |
| calculateDTI() | income, housing, debts | DTI %, qualification status |
| calculateMaxHomePrice() | income, debts, downPmt, rate, term | Max affordable price |
| calculateRemainingBalance() | principal, rate, term, monthsPaid | Remaining loan balance |
| calculateExitProceeds() | futureValue, loanBalance, sellingCosts, ownership% | Net proceeds per person |
| calculateROI() | proceeds, totalContribution, monthsHeld | Total ROI, annualized ROI |
| applyTaxStrategy() | gain, strategy, yearsOwned | Taxable gain after strategy |
| encodeShareURL() | calculatorState | Shareable URL string |
| decodeShareURL() | urlParams | calculatorState object |

# **11\. API Endpoints**

## **11.1 Calculator Sessions**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/calculator/sessions | Create new calculator session |
| GET | /api/calculator/sessions/:id | Get session by ID |
| PUT | /api/calculator/sessions/:id | Update session inputs/outputs |
| GET | /api/calculator/sessions/share/:token | Get session by share token |
| POST | /api/calculator/sessions/:id/share | Generate share token and URL |

## **11.2 Contributors**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/calculator/sessions/:id/contributors | Add contributor to session |
| PUT | /api/calculator/contributors/:id | Update contributor |
| DELETE | /api/calculator/contributors/:id | Remove contributor |

## **11.3 Scenarios**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/calculator/sessions/:id/scenarios | Add scenario to session |
| PUT | /api/calculator/scenarios/:id | Update scenario |
| DELETE | /api/calculator/scenarios/:id | Delete scenario |
| PUT | /api/calculator/scenarios/:id/tax/:contributorId | Set tax strategy for contributor in scenario |

## **11.4 Calculations**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/calculator/calculate | Stateless calculation (no session required) |
| GET | /api/calculator/rates/current | Get current interest rates (integration) |

## **11.5 Exercise Integration**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/calculator/sessions/:id/populate-from-exercises | Pre-populate from group exercise data |

# **12\. Functional Requirements**

## **12.1 Core Calculations**

1. System shall calculate monthly P\&I using standard amortization formula  
2. System shall calculate ownership % based on full-term contribution  
3. System shall support unequal contribution splits across named co-owners  
4. System shall support both Bottoms-Up and Top-Down calculation modes  
5. System shall visualize ownership distribution via donut chart

## **12.2 Affordability**

1. System shall calculate DTI based on income and debt inputs  
2. System shall apply DTI thresholds based on property type (primary: 43%, secondary/investment: 36%)  
3. System shall show qualification indicator (green/yellow/red)  
4. System shall calculate max home price from budget inputs (reverse calculation)  
5. System shall support solo-buy mode toggle for comparison

## **12.3 Tax Modeling**

1. System shall estimate annual mortgage interest deduction per co-owner  
2. System shall estimate annual property tax deduction per co-owner  
3. System shall support tax strategy selection: None, Section 121, 1031 Exchange  
4. System shall calculate Section 121 exclusion per qualifying co-owner ($250K each)  
5. System shall display tax disclaimers contextually

## **12.4 Exit Scenarios**

1. System shall support multiple exit scenarios per session  
2. System shall calculate future value based on appreciation assumptions  
3. System shall calculate remaining mortgage balance at exit point  
4. System shall calculate net distributable proceeds including Tomi's 1%  
5. System shall calculate per-person ROI and annualized ROI  
6. System shall show rent vs. co-own comparison for 60+ month scenarios

## **12.5 Sharing**

1. System shall encode calculator state into shareable URL parameters  
2. System shall decode URL parameters to pre-populate calculator  
3. System shall support optional email gate before generating share link  
4. System shall generate dynamic OG images for social sharing  
5. System shall persist calculator sessions for logged-in users

# **13\. Out of Scope (MVP)**

* Real-time interest rate API integration (manual input for MVP)  
* Property data lookup by address  
* Buyout financing scenarios (how remaining co-owners finance buyout)  
* Historical market appreciation data by zip code  
* PMI calculations (private mortgage insurance)  
* Detailed tax bracket modeling  
* PDF export (Phase 2\)

# **14\. Open Questions**

1. Should we show Tomi's 1% in the ownership donut chart, or only in exit proceeds? (Lean: Only in exit proceeds — less confusing)  
2. Should DTI calculations include property taxes and insurance estimates? (Lean: Yes, use PITI for more accurate qualification)  
3. Should we integrate with Freddie Mac or similar for live rate data? (Lean: Phase 2\)

# **15\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| Monthly payment calculation matches standard amortization formula | Unit test | Pass |
| Ownership % sums to 100% (excluding Tomi's 1%) | Unit test | Pass |
| Bottoms-Up mode calculates max home price correctly | Unit test | Pass |
| Top-Down mode splits payments by ownership % | Unit test | Pass |
| DTI calculation uses correct thresholds by property type | Unit test | Pass |
| Exit scenario calculates remaining balance correctly | Unit test | Pass |
| Section 121 applies $250K exclusion per qualifying person | Unit test | Pass |
| Shareable URL encodes and decodes state correctly | E2E test | Pass |
| Donut chart renders ownership proportions accurately | Visual test | Pass |
| Add/remove co-owners works without errors | E2E test | Pass |
| Add/remove scenarios works without errors | E2E test | Pass |
| Tax strategy selector updates taxable gain correctly | Unit test | Pass |
| Exercise data pre-populates contributors correctly | Integration test | Pass |

# **16\. Migration from Existing Code**

Consolidate existing calculator implementations into the new three-tier architecture.

## **16.1 Files to Refactor**

| Current Location | Action |
| :---- | :---- |
| src/hooks/useHouseData.ts | Extract calculations to lib/calculations/ |
| src/shared/components/calculator/ | Refactor to use shared calculation library |
| src/shared/components/CoOwnershipCalculator/ | Replace with Tier 1 component |
| src/pages/calculator/ | Migrate to Tier 2 \+ Tier 3 components |
| src/pages/co-ownership-calculator/ | Replace with unified calculator page |
| src/pages/homeownership-tool/ | Evaluate for consolidation or removal |

## **16.2 Keep Existing Prototype**

The existing advanced calculator prototype (visible in screenshots) represents the target state for Tier 2 and Tier 3\. New development should match its functionality and extend it with the features specified in this PRD (DTI, shareable URLs, exercise integration).

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft based on existing prototype reference |

