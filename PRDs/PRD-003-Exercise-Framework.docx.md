# **PRD-003: Individual Exercise Framework**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 0 — Foundation |
| **Dependencies** | PRD-001 (Auth), PRD-002 (Journey) |

# **1\. Overview**

This PRD defines the technical framework for rendering, validating, and capturing user responses to exercises. It specifies the JSON schema structure, question types, branching logic, validation rules, and analytics integration. The goal is a flexible, schema-driven system that allows new exercises to be added without code changes.

## **1.1 Purpose**

Provide a reusable exercise rendering engine that dynamically generates forms from JSON schemas, handles conditional display logic, enforces validation rules, tracks detailed analytics via PostHog, and persists responses with auto-save functionality.

## **1.2 Design Principles**

* **Schema-driven:** Exercises defined entirely in JSON; no component code per exercise  
* **Progressive disclosure:** One question per screen, branching hides irrelevant questions  
* **Resilient:** Auto-save on every interaction; resume from any point  
* **Observable:** Every interaction tracked for funnel optimization  
* **Accessible:** WCAG 2.1 AA compliant, keyboard navigable

## **1.3 Success Criteria**

* New exercise can be added via DB seed in under 30 minutes  
* Exercise renders correctly on mobile and desktop  
* Auto-save latency under 500ms  
* PostHog captures all defined events  
* Zero data loss on browser crash/refresh

# **2\. Exercise Schema Structure**

Each exercise is defined by a JSON object stored in the exercise\_templates.schema column. The schema follows a custom DSL (not JSON Schema) optimized for form rendering.

## **2.1 Top-Level Schema**

ExerciseSchema {

  "version": "1.0",  
  "questions": Question\[\],  
  "scoring": ScoringConfig,  
  "completion": CompletionConfig  
}

## **2.2 Question Object**

| Field | Type | Description |
| :---- | :---- | :---- |
| id | string | Unique identifier within exercise (e.g., "credit\_score") |
| type | QuestionType | Input type (see Section 3\) |
| label | string | Question text displayed to user |
| description | string? | Optional helper text below label |
| required | boolean | Whether answer is required |
| validation | ValidationMode | "strict" (block) or "soft" (warn) |
| options | Option\[\]? | For select/multi-select/ranking types |
| config | TypeConfig? | Type-specific configuration |
| showWhen | Condition? | Branching condition (see Section 4\) |
| scoring | QuestionScoring? | How this question contributes to score |

## **2.3 Example Question Definition**

{

  "id": "credit\_score",  
  "type": "single\_select",  
  "label": "What is your approximate credit score?",  
  "description": "Check Credit Karma or your bank app if unsure",  
  "required": true,  
  "validation": "strict",  
  "options": \[  
    { "value": "below\_620", "label": "Below 620" },  
    { "value": "620\_679", "label": "620-679" },  
    { "value": "680\_739", "label": "680-739" },  
    { "value": "740\_plus", "label": "740+" }  
  \],  
  "scoring": {  
    "type": "map",  
    "scores": {  
      "below\_620": 0, "620\_679": 10,  
      "680\_739": 20, "740\_plus": 25  
    }  
  }  
}

# **3\. Question Types**

The framework supports the following input types, each mapped to a shadcn/ui component.

| Type | Component | Config Options | Output Value |
| :---- | :---- | :---- | :---- |
| single\_select | RadioGroup | options\[\] | string (option value) |
| multi\_select | Checkbox group | options\[\], min, max | string\[\] |
| number | Input type=number | min, max, step, prefix, suffix | number |
| currency | CurrencyInput | min, max, currency | number (cents) |
| slider | Slider | min, max, step, labels | number |
| range\_slider | Dual Slider | min, max, step | \[number, number\] |
| text | Input type=text | maxLength, placeholder | string |
| textarea | Textarea | maxLength, rows | string |
| ranking | dnd-kit Sortable | options\[\] | string\[\] (ordered) |
| location | LocationSearch | multiple, types\[\] | PlaceResult\[\] |
| date | DatePicker | minDate, maxDate | ISO date string |

## **3.1 Type-Specific Configuration Examples**

### **Currency Input**

{

  "type": "currency",  
  "config": {  
    "min": 0,  
    "max": 10000000,  
    "currency": "USD",  
    "placeholder": "Enter amount"  
  }  
}

### **Slider with Labels**

{

  "type": "slider",  
  "config": {  
    "min": 1,  
    "max": 5,  
    "step": 1,  
    "labels": {  
      "1": "Very Private",  
      "3": "Balanced",  
      "5": "Very Communal"  
    }  
  }  
}

### **Ranking (Drag & Drop)**

{

  "type": "ranking",  
  "label": "Rank these neighborhood factors by importance",  
  "options": \[  
    { "value": "walkability", "label": "Walkability" },  
    { "value": "schools", "label": "School Quality" },  
    { "value": "transit", "label": "Public Transit" },  
    { "value": "safety", "label": "Safety" },  
    { "value": "nightlife", "label": "Nightlife/Dining" }  
  \]  
}

### **Multi-Select with Limits**

{

  "type": "multi\_select",  
  "label": "Select your top 3 must-have features",  
  "config": { "min": 1, "max": 3 },  
  "options": \[  
    { "value": "parking", "label": "Parking" },  
    { "value": "yard", "label": "Yard/Outdoor Space" },  
    { "value": "office", "label": "Home Office" },  
    ...  
  \]  
}

# **4\. Branching Logic**

Questions can be conditionally shown or hidden based on previous answers. The framework supports basic single-condition branching (MVP) with a path to complex multi-condition logic later.

## **4.1 Condition Structure**

| Field | Type | Description |
| :---- | :---- | :---- |
| questionId | string | ID of the question to check |
| operator | Operator | equals, notEquals, contains, greaterThan, lessThan |
| value | any | Value to compare against |

## **4.2 Example: Show Question Based on Previous Answer**

{

  "id": "cobuyer\_search\_method",  
  "type": "single\_select",  
  "label": "How do you plan to find co-buyers?",  
  "showWhen": {  
    "questionId": "cobuyer\_status",  
    "operator": "equals",  
    "value": "seeking"  
  },  
  "options": \[  
    { "value": "friends", "label": "Friends/Family" },  
    { "value": "platform", "label": "Tomi Matching" },  
    { "value": "other", "label": "Other" }  
  \]  
}

## **4.3 Supported Operators**

| Operator | Applicable Types | Example |
| :---- | :---- | :---- |
| equals | All types | value \=== target |
| notEquals | All types | value \!== target |
| contains | multi\_select, text | array.includes(target) |
| notContains | multi\_select, text | \!array.includes(target) |
| greaterThan | number, currency, slider | value \> target |
| lessThan | number, currency, slider | value \< target |
| isEmpty | All types | value \=== null/undefined/'' |
| isNotEmpty | All types | value \!== null/undefined/'' |

## **4.4 Branching Behavior**

* Hidden questions are skipped in navigation (Back/Next)  
* Hidden questions are excluded from completion percentage  
* Hidden questions are excluded from scoring  
* If a question becomes hidden after being answered, response is preserved but ignored  
* Condition is re-evaluated on every response change

# **5\. Validation Rules**

## **5.1 Validation Modes**

| Required | Mode | Behavior |
| :---- | :---- | :---- |
| true | strict | Block navigation until valid answer provided |
| true | soft | Show warning, allow skip with confirmation |
| false | — | No validation, skip freely |

## **5.2 Type-Specific Validation**

| Type | Built-in Validation |
| :---- | :---- |
| number | Must be within min/max if specified; must be valid number |
| currency | Must be within min/max; must be valid currency format |
| text | Must not exceed maxLength if specified |
| multi\_select | Selection count must be within min/max if specified |
| ranking | All options must be ranked (no partial ranking) |
| location | Must be valid place result from search |

## **5.3 Custom Validation (Future)**

Schema supports a 'validate' field for custom validation rules. MVP uses built-in validation only. Custom validation (regex patterns, cross-field validation) deferred to Phase 2\.

# **6\. Scoring Configuration**

## **6.1 Question-Level Scoring Types**

| Type | Description |
| :---- | :---- |
| map | Direct mapping from option values to scores |
| range | Score based on where value falls in ranges |
| linear | Linear interpolation between min/max scores |
| completeness | Score based on whether answered (binary) |
| ranking\_weighted | Higher score for items ranked higher |

## **6.2 Example: Range-Based Scoring**

{

  "scoring": {  
    "type": "range",  
    "ranges": \[  
      { "min": 0, "max": 10000, "score": 5 },  
      { "min": 10001, "max": 50000, "score": 10 },  
      { "min": 50001, "max": 100000, "score": 15 },  
      { "min": 100001, "max": null, "score": 20 }  
    \]  
  }  
}

## **6.3 Exercise-Level Scoring**

The exercise\_templates.scoring\_rules column defines how question scores aggregate:

{

  "scoring\_rules": {  
    "method": "weighted\_sum",  
    "maxScore": 100,  
    "weights": {  
      "credit\_score": 0.25,  
      "dti\_ratio": 0.25,  
      "down\_payment": 0.20,  
      "employment": 0.15,  
      "preapproval": 0.15  
    }  
  }  
}

# **7\. Functional Requirements**

## **7.1 Schema Processing**

1. System shall parse and validate exercise schema on load  
2. System shall reject malformed schemas with descriptive errors  
3. System shall support schema versioning for backward compatibility  
4. System shall cache parsed schemas for performance

## **7.2 Rendering Engine**

1. System shall render appropriate component for each question type  
2. System shall display one question per screen on mobile, optionally group on desktop  
3. System shall show progress indicator (X of Y questions)  
4. System shall calculate visible question count excluding hidden questions  
5. System shall support keyboard navigation (Tab, Enter, Arrow keys)  
6. System shall render description/helper text when provided

## **7.3 Branching Engine**

1. System shall evaluate showWhen conditions on every response change  
2. System shall hide questions when conditions are not met  
3. System shall preserve hidden question responses in case condition changes  
4. System shall exclude hidden questions from scoring calculations

## **7.4 Validation Engine**

1. System shall validate response against question config on navigation  
2. System shall display inline error messages for invalid responses  
3. System shall block Next button for strict validation failures  
4. System shall show skip confirmation modal for soft validation  
5. System shall allow Back navigation regardless of validation state

## **7.5 Analytics Integration**

1. System shall initialize PostHog on exercise load  
2. System shall track events defined in Section 8  
3. System shall include exercise\_slug and question\_id in all events  
4. System shall capture time spent per question

# **8\. PostHog Analytics Events**

| Event Name | Trigger | Properties |
| :---- | :---- | :---- |
| exercise\_started | User opens exercise | exercise\_slug, is\_retake, source |
| exercise\_completed | User finishes last question | exercise\_slug, duration\_sec, score |
| exercise\_abandoned | User leaves mid-exercise | exercise\_slug, last\_question, pct\_complete |
| question\_viewed | Question becomes visible | exercise\_slug, question\_id, question\_index |
| question\_answered | User provides answer | exercise\_slug, question\_id, time\_to\_answer\_sec |
| question\_skipped | User skips optional question | exercise\_slug, question\_id |
| validation\_error | Validation fails | exercise\_slug, question\_id, error\_type |
| back\_navigation | User clicks Back | exercise\_slug, from\_question, to\_question |

## **8.1 Funnel Analysis Setup**

PostHog funnel should be configured with these steps:

* exercise\_started → question\_viewed (Q1) → question\_answered (Q1) → ... → exercise\_completed  
* Group by: exercise\_slug, user cohort, device type

## **8.2 Heatmap Configuration**

* Enable autocapture for click/touch on exercise pages  
* Track slider drag interactions  
* Track ranking drag-and-drop reorders

# **9\. Component Architecture**

## **9.1 Component Hierarchy**

ExerciseProvider (context)

├── ExerciseContainer  
│   ├── ProgressBar  
│   ├── QuestionRenderer  
│   │   ├── QuestionLabel  
│   │   ├── QuestionDescription  
│   │   ├── \[InputComponent\] (type-specific)  
│   │   └── ValidationError  
│   └── NavigationControls  
│       ├── BackButton  
│       ├── NextButton / SubmitButton  
│       └── SkipButton (if applicable)  
└── CompletionScreen  
    ├── ScoreDisplay  
    └── NextStepsCTA

## **9.2 Context State Shape**

ExerciseContext {

  schema: ExerciseSchema  
  responses: Record\<string, any\>  
  currentIndex: number  
  visibleQuestions: Question\[\]  
  validationErrors: Record\<string, string\>  
  isSubmitting: boolean  
  startTime: Date  
  questionStartTime: Date  
    
  // Actions  
  setResponse(questionId: string, value: any): void  
  goNext(): void  
  goBack(): void  
  skip(): void  
  submit(): Promise\<void\>  
}

## **9.3 Input Component Mapping**

| Question Type | Component File | Dependencies |
| :---- | :---- | :---- |
| single\_select | SingleSelect.tsx | shadcn/RadioGroup |
| multi\_select | MultiSelect.tsx | shadcn/Checkbox |
| number | NumberInput.tsx | shadcn/Input |
| currency | CurrencyInput.tsx | react-number-format |
| slider | SliderInput.tsx | shadcn/Slider |
| range\_slider | RangeSlider.tsx | shadcn/Slider (dual) |
| text | TextInput.tsx | shadcn/Input |
| textarea | TextareaInput.tsx | shadcn/Textarea |
| ranking | RankingInput.tsx | @dnd-kit/core, @dnd-kit/sortable |
| location | LocationInput.tsx | Google Places API |
| date | DateInput.tsx | shadcn/Calendar, date-fns |

# **10\. Auto-Save Behavior**

## **10.1 Save Triggers**

* On every response change (debounced 500ms)  
* On navigation (Back/Next/Skip)  
* On browser beforeunload event  
* On visibility change (tab switch)

## **10.2 Save Payload**

PATCH /api/exercises/:slug

{  
  "responses": { "question\_id": value, ... },  
  "currentIndex": 3,  
  "lastSavedAt": "2024-12-15T10:30:00Z"  
}

## **10.3 Conflict Resolution**

Last-write-wins strategy. If user opens same exercise in multiple tabs, most recent save overwrites. Future enhancement: real-time sync with optimistic locking.

## **10.4 UI Feedback**

* Subtle "Saving..." indicator during save  
* "Saved" checkmark on success (fades after 2s)  
* Error toast on save failure with retry option

# **11\. API Endpoints**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/exercises | List exercises available for user's journey stage |
| GET | /api/exercises/:slug | Get exercise schema \+ user's current responses |
| POST | /api/exercises/:slug/start | Initialize or resume exercise response record |
| PATCH | /api/exercises/:slug | Save partial responses (auto-save) |
| POST | /api/exercises/:slug/complete | Mark complete, compute scores, update journey |
| POST | /api/exercises/:slug/retake | Start new version, preserve previous |
| GET | /api/exercises/:slug/score | Get computed score breakdown |

# **12\. Dependencies**

| Package | Version | Purpose |
| :---- | :---- | :---- |
| @dnd-kit/core | ^6.1.0 | Drag and drop foundation |
| @dnd-kit/sortable | ^8.0.0 | Sortable lists for ranking |
| react-number-format | ^5.3.0 | Currency/number formatting |
| posthog-js | ^1.96.0 | Analytics tracking |
| zod | ^3.22.0 | Schema validation |
| date-fns | ^3.0.0 | Date utilities |
| usehooks-ts | ^2.9.0 | useDebounce, useLocalStorage |

# **13\. Out of Scope (MVP)**

* Complex multi-condition branching (AND/OR logic) — Phase 2  
* Custom validation rules (regex, cross-field) — Phase 2  
* Exercise editor UI for non-technical admins — Phase 3  
* A/B testing question variants — Phase 3  
* Offline mode with sync — Mobile phase  
* Real-time collaborative exercises — Group phase

# **14\. Open Questions**

1. Should we support image/icon options for single/multi-select?  
2. Maximum questions per exercise before we recommend splitting?  
3. Should PostHog capture actual response values (privacy consideration)?

# **15\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| All 12 question types render correctly | Visual test | Pass |
| Branching shows/hides questions correctly | Unit test | Pass |
| Strict validation blocks navigation | Manual test | Pass |
| Soft validation shows warning, allows skip | Manual test | Pass |
| Auto-save triggers on response change | API test | \<1s |
| Progress survives page refresh | Manual test | Pass |
| PostHog events fire correctly | PostHog debug | All events |
| Score computation matches expected | Unit test | Pass |
| Keyboard navigation works (Tab, Enter) | Manual test | Pass |
| Mobile responsive (all types usable) | Device test | Pass |
| Ranking drag-drop works on touch | Device test | Pass |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

