-- ============================================
-- SEED EXERCISE TEMPLATES (PRD-002)
-- 4 core exercises for the individual journey.
-- Each template uses a JSON schema that the
-- frontend renders dynamically.
-- ============================================

-- 1. FINANCIAL READINESS (required, 5 min)
INSERT INTO public.exercise_templates (slug, name, description, category, journey_stages, schema, scoring_rules, display_order, is_required, estimated_minutes, is_active)
VALUES (
  'financial_readiness',
  'Financial Readiness',
  'Assess your financial preparedness for co-ownership, including savings, credit, and budget.',
  'individual',
  '["exploring", "educating", "preparing"]'::jsonb,
  '{
    "version": 1,
    "questions": [
      {
        "key": "savings",
        "question": "How much have you saved for a down payment?",
        "type": "single_select",
        "options": [
          { "label": "Less than $10,000", "value": "under_10k", "score": 0 },
          { "label": "$10,000 - $25,000", "value": "10k_25k", "score": 1 },
          { "label": "$25,000 - $50,000", "value": "25k_50k", "score": 2 },
          { "label": "More than $50,000", "value": "over_50k", "score": 3 }
        ],
        "required": true
      },
      {
        "key": "monthly_budget",
        "question": "What monthly housing payment can you comfortably afford?",
        "type": "single_select",
        "options": [
          { "label": "Under $1,000", "value": "under_1000", "score": 0 },
          { "label": "$1,000 - $1,500", "value": "1000_1500", "score": 1 },
          { "label": "$1,500 - $2,500", "value": "1500_2500", "score": 2 },
          { "label": "Over $2,500", "value": "over_2500", "score": 3 }
        ],
        "required": true
      },
      {
        "key": "dti_ratio",
        "question": "What is your approximate debt-to-income ratio?",
        "subtext": "Total monthly debt payments divided by gross monthly income",
        "type": "single_select",
        "options": [
          { "label": "Over 40%", "value": "over_40", "score": 0 },
          { "label": "30% - 40%", "value": "30_40", "score": 1 },
          { "label": "20% - 30%", "value": "20_30", "score": 2 },
          { "label": "Under 20%", "value": "under_20", "score": 3 }
        ],
        "required": true
      },
      {
        "key": "credit_score",
        "question": "What is your credit score range?",
        "type": "single_select",
        "options": [
          { "label": "Below 620", "value": "below_620", "score": 0 },
          { "label": "620 - 679", "value": "620_679", "score": 1 },
          { "label": "680 - 739", "value": "680_739", "score": 2 },
          { "label": "740+", "value": "740_plus", "score": 3 }
        ],
        "required": true
      },
      {
        "key": "employment_stability",
        "question": "How long have you been at your current job?",
        "type": "single_select",
        "options": [
          { "label": "Less than 1 year", "value": "under_1yr", "score": 0 },
          { "label": "1 - 2 years", "value": "1_2yr", "score": 1 },
          { "label": "2 - 5 years", "value": "2_5yr", "score": 2 },
          { "label": "5+ years", "value": "5_plus", "score": 3 }
        ],
        "required": true
      },
      {
        "key": "pre_approval",
        "question": "Have you started the mortgage pre-approval process?",
        "type": "single_select",
        "options": [
          { "label": "Not yet", "value": "not_started", "score": 0 },
          { "label": "Researching lenders", "value": "researching", "score": 1 },
          { "label": "Application in progress", "value": "in_progress", "score": 2 },
          { "label": "Already pre-approved", "value": "approved", "score": 3 }
        ],
        "required": true
      }
    ]
  }'::jsonb,
  '{
    "method": "weighted_sum",
    "maxScore": 18,
    "weights": {
      "credit_score": 0.25,
      "dti_ratio": 0.25,
      "savings": 0.20,
      "employment_stability": 0.15,
      "pre_approval": 0.15
    },
    "readinessWeight": 0.40
  }'::jsonb,
  1,
  true,
  5,
  true
);

-- 2. HOUSING PREFERENCES (required, 8 min)
INSERT INTO public.exercise_templates (slug, name, description, category, journey_stages, schema, scoring_rules, display_order, is_required, estimated_minutes, is_active)
VALUES (
  'housing_preferences',
  'Housing Preferences',
  'Define your ideal home, neighborhood, and must-haves to help match you with compatible co-buyers.',
  'individual',
  '["exploring", "educating", "preparing"]'::jsonb,
  '{
    "version": 1,
    "questions": [
      {
        "key": "target_metros",
        "question": "What metro area(s) are you considering?",
        "subtext": "Select all that apply",
        "type": "multi_select",
        "options": [
          { "label": "San Francisco Bay Area", "value": "sf_bay" },
          { "label": "Los Angeles", "value": "la" },
          { "label": "New York City", "value": "nyc" },
          { "label": "Austin", "value": "austin" },
          { "label": "Seattle", "value": "seattle" },
          { "label": "Denver", "value": "denver" },
          { "label": "Miami", "value": "miami" },
          { "label": "Chicago", "value": "chicago" },
          { "label": "Portland", "value": "portland" },
          { "label": "Other", "value": "other" }
        ],
        "required": true
      },
      {
        "key": "property_type",
        "question": "Rank your preferred property types (most to least preferred)",
        "type": "ranking",
        "options": [
          { "label": "Single-family home", "value": "single_family" },
          { "label": "Condo / Apartment", "value": "condo" },
          { "label": "Townhouse", "value": "townhouse" },
          { "label": "Multi-family (duplex/triplex)", "value": "multi_family" }
        ],
        "required": true
      },
      {
        "key": "bedrooms",
        "question": "Minimum number of bedrooms?",
        "type": "single_select",
        "options": [
          { "label": "1 bedroom", "value": "1" },
          { "label": "2 bedrooms", "value": "2" },
          { "label": "3 bedrooms", "value": "3" },
          { "label": "4+ bedrooms", "value": "4_plus" }
        ],
        "required": true
      },
      {
        "key": "must_haves",
        "question": "Which features are must-haves for you?",
        "subtext": "Select all that apply",
        "type": "multi_select",
        "options": [
          { "label": "Parking / Garage", "value": "parking" },
          { "label": "Yard / Outdoor space", "value": "yard" },
          { "label": "Home office", "value": "home_office" },
          { "label": "In-unit laundry", "value": "laundry" },
          { "label": "Central A/C", "value": "ac" },
          { "label": "Pet-friendly", "value": "pets" },
          { "label": "EV charging", "value": "ev" },
          { "label": "Storage space", "value": "storage" }
        ],
        "required": false
      },
      {
        "key": "deal_breakers",
        "question": "Are there any deal-breakers?",
        "subtext": "Select all that apply",
        "type": "multi_select",
        "options": [
          { "label": "HOA over $500/month", "value": "high_hoa" },
          { "label": "Shared walls", "value": "shared_walls" },
          { "label": "No pets allowed", "value": "no_pets" },
          { "label": "Street parking only", "value": "street_parking" },
          { "label": "No outdoor space", "value": "no_outdoor" },
          { "label": "Major renovation needed", "value": "renovation" }
        ],
        "required": false
      },
      {
        "key": "neighborhood_priorities",
        "question": "Rank your neighborhood priorities (most to least important)",
        "type": "ranking",
        "options": [
          { "label": "Walkability & transit", "value": "walkability" },
          { "label": "School quality", "value": "schools" },
          { "label": "Nightlife & dining", "value": "nightlife" },
          { "label": "Safety & quiet", "value": "safety" },
          { "label": "Parks & nature", "value": "parks" },
          { "label": "Commute time", "value": "commute" }
        ],
        "required": true
      }
    ]
  }'::jsonb,
  '{
    "method": "completeness",
    "maxScore": 100,
    "readinessWeight": 0.20
  }'::jsonb,
  2,
  true,
  8,
  true
);

-- 3. LIFESTYLE & LIVING ARRANGEMENT (recommended, 6 min)
INSERT INTO public.exercise_templates (slug, name, description, category, journey_stages, schema, scoring_rules, display_order, is_required, estimated_minutes, is_active)
VALUES (
  'lifestyle_arrangement',
  'Lifestyle & Living Arrangement',
  'Understand your living preferences and how they might align with potential co-owners.',
  'individual',
  '["educating", "preparing"]'::jsonb,
  '{
    "version": 1,
    "questions": [
      {
        "key": "occupancy_intent",
        "question": "How do you plan to use this property?",
        "type": "single_select",
        "options": [
          { "label": "Primary residence (live there full-time)", "value": "primary" },
          { "label": "Part-time residence", "value": "part_time" },
          { "label": "Investment only (not living there)", "value": "investment" }
        ],
        "required": true
      },
      {
        "key": "household_composition",
        "question": "Who will be living in the home?",
        "subtext": "Select all that apply",
        "type": "multi_select",
        "options": [
          { "label": "Just me", "value": "solo" },
          { "label": "Partner / Spouse", "value": "partner" },
          { "label": "Children", "value": "children" },
          { "label": "Pets", "value": "pets" }
        ],
        "required": true
      },
      {
        "key": "usage_type",
        "question": "What type of co-ownership arrangement interests you?",
        "subtext": "TACO = Everyone lives there. SACO = Shared use/rotation. Investment = Pure financial.",
        "type": "single_select",
        "options": [
          { "label": "TACO (all co-owners live together)", "value": "taco" },
          { "label": "SACO (shared/rotating use)", "value": "saco" },
          { "label": "Investment-only", "value": "investment" }
        ],
        "required": true
      },
      {
        "key": "work_situation",
        "question": "What is your current work situation?",
        "type": "single_select",
        "options": [
          { "label": "Fully remote", "value": "remote" },
          { "label": "Hybrid (some office, some remote)", "value": "hybrid" },
          { "label": "Fully in-office", "value": "in_office" },
          { "label": "Varies / Freelance", "value": "varies" }
        ],
        "required": true
      },
      {
        "key": "noise_tolerance",
        "question": "How would you describe your ideal home environment?",
        "type": "slider",
        "min": 1,
        "max": 5,
        "minLabel": "Quiet & peaceful",
        "maxLabel": "Lively & social",
        "required": true
      },
      {
        "key": "guest_frequency",
        "question": "How often do you have guests over?",
        "type": "single_select",
        "options": [
          { "label": "Rarely", "value": "rarely" },
          { "label": "A few times a month", "value": "monthly" },
          { "label": "Weekly", "value": "weekly" },
          { "label": "Very often", "value": "often" }
        ],
        "required": true
      },
      {
        "key": "revenue_intent",
        "question": "Would you want to rent out part of the property (e.g., Airbnb, long-term tenant)?",
        "type": "single_select",
        "options": [
          { "label": "Yes, definitely", "value": "yes" },
          { "label": "Maybe, open to it", "value": "maybe" },
          { "label": "No, prefer not to", "value": "no" }
        ],
        "required": true
      },
      {
        "key": "shared_space_comfort",
        "question": "How comfortable are you sharing common spaces (kitchen, living room)?",
        "type": "slider",
        "min": 1,
        "max": 5,
        "minLabel": "Prefer everything private",
        "maxLabel": "Happy sharing most spaces",
        "required": true
      }
    ]
  }'::jsonb,
  '{
    "method": "completeness",
    "maxScore": 100,
    "readinessWeight": 0.20
  }'::jsonb,
  3,
  false,
  6,
  true
);

-- 4. TIMELINE & COMMITMENT (required, 4 min)
INSERT INTO public.exercise_templates (slug, name, description, category, journey_stages, schema, scoring_rules, display_order, is_required, estimated_minutes, is_active)
VALUES (
  'timeline_commitment',
  'Timeline & Commitment',
  'Clarify your buying timeline, expected ownership duration, and co-buyer readiness.',
  'individual',
  '["exploring", "educating", "preparing"]'::jsonb,
  '{
    "version": 1,
    "questions": [
      {
        "key": "timeline",
        "question": "When would you like to buy?",
        "type": "single_select",
        "options": [
          { "label": "Within 3 months", "value": "3mo", "score": 3 },
          { "label": "3 - 6 months", "value": "6mo", "score": 3 },
          { "label": "6 - 12 months", "value": "12mo", "score": 2 },
          { "label": "12 - 18 months", "value": "18mo", "score": 1 },
          { "label": "Just exploring", "value": "exploring", "score": 0 }
        ],
        "required": true
      },
      {
        "key": "ownership_duration",
        "question": "How long do you expect to co-own?",
        "type": "single_select",
        "options": [
          { "label": "2 - 3 years", "value": "2_3yr", "score": 1 },
          { "label": "3 - 5 years", "value": "3_5yr", "score": 2 },
          { "label": "5 - 10 years", "value": "5_10yr", "score": 3 },
          { "label": "10+ years", "value": "10_plus", "score": 3 },
          { "label": "Not sure yet", "value": "unsure", "score": 0 }
        ],
        "required": true
      },
      {
        "key": "cobuyer_status",
        "question": "Do you already have co-buyers in mind?",
        "type": "single_select",
        "options": [
          { "label": "Yes, we have a group", "value": "have_group", "score": 3 },
          { "label": "I have one person in mind", "value": "have_one", "score": 2 },
          { "label": "Actively looking", "value": "seeking", "score": 1 },
          { "label": "Open to finding co-buyers", "value": "open", "score": 0 }
        ],
        "required": true
      },
      {
        "key": "timeline_flexibility",
        "question": "How flexible is your timeline?",
        "type": "slider",
        "min": 1,
        "max": 5,
        "minLabel": "Very fixed",
        "maxLabel": "Very flexible",
        "required": true
      },
      {
        "key": "current_housing",
        "question": "What is your current housing situation?",
        "type": "single_select",
        "options": [
          { "label": "Renting", "value": "renting", "score": 2 },
          { "label": "Living with family", "value": "family", "score": 1 },
          { "label": "Own a home", "value": "own", "score": 2 },
          { "label": "Other", "value": "other", "score": 1 }
        ],
        "required": true
      }
    ]
  }'::jsonb,
  '{
    "method": "weighted_sum",
    "maxScore": 14,
    "weights": {
      "timeline": 0.30,
      "ownership_duration": 0.20,
      "cobuyer_status": 0.30,
      "current_housing": 0.20
    },
    "readinessWeight": 0.20
  }'::jsonb,
  4,
  true,
  4,
  true
);
