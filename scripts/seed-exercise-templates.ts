/**
 * Seed Exercise Templates
 *
 * Run with: npx tsx scripts/seed-exercise-templates.ts
 *
 * Seeds the three exercise templates needed for Phases 0-2:
 * - gems_discovery (Phase 0 — conversational)
 * - roadmap_walkthrough (Phase 1 — walkthrough)
 * - cobuyer_candidate_assessment (Phase 2 — conversational)
 *
 * Safe to run multiple times — uses upsert on slug.
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { exerciseTemplates } from '../src/db/schema/journey'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('ERROR: DATABASE_URL not set. Check your .env.local or .env file.')
  process.exit(1)
}

const client = postgres(connectionString, { prepare: false })
const db = drizzle(client)

// =============================================================================
// TEMPLATE DATA
// =============================================================================

const templates = [
  // -------------------------------------------------------------------------
  // GEMs Discovery (Phase 0)
  // -------------------------------------------------------------------------
  {
    slug: 'gems_discovery',
    name: 'GEMs Discovery',
    description:
      'Discover your Goals, Expectations & Motivations for co-ownership. A conversational exercise that builds the foundation for your entire journey.',
    category: 'individual' as const,
    journeyStages: ['exploring', 'educating'],
    schema: {
      version: 1,
      renderMode: 'conversational',
      questions: [
        { key: 'primary_goal', type: 'single_select', required: true, options: [
          { value: 'build_wealth', label: 'Build wealth' },
          { value: 'afford_better', label: 'Afford a better home' },
          { value: 'stop_renting', label: 'Stop renting' },
          { value: 'near_people', label: 'Live near family/friends' },
          { value: 'investment', label: 'Investment property' },
          { value: 'other', label: 'Something else' },
        ]},
        { key: 'timeline', type: 'single_select', required: true, options: [
          { value: 'asap', label: 'ASAP (3-6 months)' },
          { value: 'this_year', label: 'This year' },
          { value: '1_2_years', label: '1-2 years' },
          { value: 'exploring', label: 'Exploring for now' },
        ]},
        { key: 'goal_depth', type: 'text', required: false },
        { key: 'commitment_duration', type: 'single_select', required: true, options: [
          { value: '2_3_years', label: '2-3 years' },
          { value: '3_5_years', label: '3-5 years' },
          { value: '5_10_years', label: '5-10 years' },
          { value: '10_plus', label: '10+ years' },
          { value: 'unsure', label: 'Not sure yet' },
        ]},
        { key: 'involvement_level', type: 'single_select', required: true, options: [
          { value: 'hands_on', label: 'Very hands-on' },
          { value: 'moderate', label: 'Moderate — split duties' },
          { value: 'minimal', label: 'Minimal — hire it out' },
          { value: 'unsure', label: 'Not sure' },
        ]},
        { key: 'success_vision', type: 'text', required: false },
        { key: 'trigger', type: 'single_select', required: true, options: [
          { value: 'priced_out', label: 'Priced out of market' },
          { value: 'suggestion', label: 'Friend/family suggested it' },
          { value: 'heard_tic', label: 'Heard about TIC' },
          { value: 'saw_tomi', label: 'Saw Tomi' },
          { value: 'tired_renting', label: 'Tired of renting' },
          { value: 'want_invest', label: 'Want to invest' },
        ]},
        { key: 'urgency', type: 'single_select', required: true, options: [
          { value: 'very', label: 'Very — I need to act soon' },
          { value: 'moderate', label: 'Moderate — motivated but not rushed' },
          { value: 'low', label: 'Low — just exploring' },
        ]},
        { key: 'concerns', type: 'text', required: false },
      ],
    },
    scoringRules: {
      method: 'completeness',
      maxScore: 100,
      readinessWeight: 0.15,
    },
    displayOrder: 1,
    isRequired: false,
    estimatedMinutes: 5,
    isActive: true,
  },

  // -------------------------------------------------------------------------
  // Roadmap Walkthrough (Phase 1)
  // -------------------------------------------------------------------------
  {
    slug: 'roadmap_walkthrough',
    name: 'What to Expect When Co-Buying',
    description:
      'A guided walkthrough of the 7-step co-buying journey — from self-assessment to closing day.',
    category: 'individual' as const,
    journeyStages: ['exploring', 'educating'],
    schema: {
      version: 1,
      renderMode: 'walkthrough',
      questions: [
        { key: 'walkthrough_completed', type: 'boolean', required: true },
        { key: 'viewed_all_steps', type: 'boolean', required: false },
      ],
    },
    scoringRules: {
      method: 'completeness',
      maxScore: 100,
      readinessWeight: 0.05,
    },
    displayOrder: 2,
    isRequired: false,
    estimatedMinutes: 8,
    isActive: true,
  },

  // -------------------------------------------------------------------------
  // Co-Buyer Candidate Assessment (Phase 2)
  // -------------------------------------------------------------------------
  {
    slug: 'cobuyer_candidate_assessment',
    name: 'Co-Buyer Compatibility Assessment',
    description:
      'Privately evaluate a potential co-ownership partner across 7 dimensions: relationship, finances, lifestyle, goals, conflict style, risk factors, and gut check.',
    category: 'individual' as const,
    journeyStages: ['educating', 'preparing'],
    schema: {
      version: 1,
      renderMode: 'conversational',
      questions: [
        // Stage 1: Relationship Foundation
        { key: 'candidate_name', type: 'text', required: true },
        { key: 'relationship_type', type: 'single_select', required: true, options: [
          { value: 'close_friend', label: 'Close friend', score: 3 },
          { value: 'family', label: 'Family member', score: 2 },
          { value: 'romantic', label: 'Romantic partner', score: 3 },
          { value: 'acquaintance', label: 'Acquaintance/colleague', score: 0 },
        ]},
        { key: 'relationship_duration', type: 'single_select', required: true, options: [
          { value: '10_plus', label: '10+ years', score: 3 },
          { value: '5_10', label: '5-10 years', score: 2 },
          { value: '2_5', label: '2-5 years', score: 1 },
          { value: 'under_2', label: 'Less than 2 years', score: 0 },
        ]},
        { key: 'lived_together', type: 'single_select', required: true, options: [
          { value: 'yes_good', label: 'Yes — it went well', score: 3 },
          { value: 'yes_challenging', label: 'Yes — it was challenging', score: 1 },
          { value: 'no_extended', label: 'No — but extended time', score: 2 },
          { value: 'no_never', label: 'No — never', score: 0 },
        ]},
        { key: 'roommate_context', type: 'text', required: false },
        // Stage 2: Financial Compatibility
        { key: 'financial_awareness', type: 'single_select', required: true, options: [
          { value: 'open', label: 'Yes — pretty open', score: 3 },
          { value: 'general', label: 'General sense', score: 2 },
          { value: 'not_discussed', label: "Haven't discussed it", score: 1 },
          { value: 'no_idea', label: 'No idea', score: 0 },
        ]},
        { key: 'shared_finances', type: 'single_select', required: true, options: [
          { value: 'bills_rent', label: 'Split bills/rent', score: 3 },
          { value: 'smaller', label: 'Smaller things', score: 2 },
          { value: 'informal', label: 'Only informal', score: 1 },
          { value: 'never', label: 'Never', score: 0 },
        ]},
        { key: 'money_personality', type: 'single_select', required: true, options: [
          { value: 'saver', label: 'Saver/planner', score: 3 },
          { value: 'balanced', label: 'Balanced', score: 2 },
          { value: 'spender', label: 'Spender', score: 1 },
          { value: 'unknown', label: "Don't know", score: 0 },
        ]},
        { key: 'financial_transparency', type: 'single_select', required: true, options: [
          { value: 'definitely', label: 'Definitely', score: 3 },
          { value: 'probably', label: 'Probably', score: 2 },
          { value: 'unsure', label: 'Not sure', score: 1 },
          { value: 'probably_not', label: 'Probably not', score: 0 },
        ]},
        // Stage 3: Lifestyle
        { key: 'lifestyle_dependents', type: 'multi_select', required: true },
        { key: 'lifestyle_sensitivities', type: 'single_select', required: true, options: [
          { value: 'none', label: 'None', score: 3 },
          { value: 'minor', label: 'Minor', score: 2 },
          { value: 'significant', label: 'Significant', score: 1 },
        ]},
        { key: 'work_situation', type: 'single_select', required: true, options: [
          { value: 'remote', label: 'Remote/hybrid', score: 2 },
          { value: 'in_office', label: 'In-office', score: 2 },
          { value: 'travels', label: 'Travels frequently', score: 1 },
          { value: 'irregular', label: 'Irregular', score: 1 },
          { value: 'unsure', label: 'Not sure', score: 0 },
        ]},
        { key: 'lifestyle_alignment', type: 'single_select', required: true, options: [
          { value: 'very', label: 'Very aligned', score: 3 },
          { value: 'mostly', label: 'Mostly aligned', score: 2 },
          { value: 'different', label: 'Pretty different', score: 0 },
          { value: 'unknown', label: "Don't know", score: 0 },
        ]},
        { key: 'substance_concerns', type: 'single_select', required: true, options: [
          { value: 'none', label: 'No concerns', score: 3 },
          { value: 'minor', label: 'Minor', score: 2 },
          { value: 'needs_conversation', label: 'Needs conversation', score: 1 },
          { value: 'uncomfortable', label: 'Uncomfortable', score: 0 },
        ]},
        // Stage 4: Goals
        { key: 'timeline_alignment', type: 'single_select', required: true, options: [
          { value: 'same_page', label: 'Same page', score: 3 },
          { value: 'close', label: 'Close', score: 2 },
          { value: 'different', label: 'Different', score: 0 },
          { value: 'not_discussed', label: 'Not discussed', score: 0 },
        ]},
        { key: 'ownership_duration', type: 'single_select', required: true, options: [
          { value: '5_plus', label: '5+ years', score: 3 },
          { value: '3_5', label: '3-5 years', score: 2 },
          { value: '1_3', label: '1-3 years', score: 1 },
          { value: 'unsure', label: 'Not sure', score: 0 },
        ]},
        { key: 'property_vision', type: 'single_select', required: true, options: [
          { value: 'live_in', label: 'Live in it', score: 3 },
          { value: 'investment', label: 'Investment', score: 3 },
          { value: 'overlapping', label: 'Overlapping', score: 1 },
          { value: 'not_discussed', label: 'Not discussed', score: 0 },
        ]},
        { key: 'buyout_expectation', type: 'single_select', required: true, options: [
          { value: 'yes_plan', label: 'Yes, the plan', score: 2 },
          { value: 'possible', label: 'Possible', score: 2 },
          { value: 'sell_together', label: 'Sell together', score: 2 },
          { value: 'not_thought', label: 'Not thought about', score: 0 },
        ]},
        // Stage 5: Conflict
        { key: 'conflict_style', type: 'single_select', required: true, options: [
          { value: 'direct', label: 'Direct & constructive', score: 3 },
          { value: 'takes_time', label: 'Takes time', score: 2 },
          { value: 'avoids', label: 'Avoids conflict', score: 0 },
          { value: 'reactive', label: 'Reactive', score: 0 },
        ]},
        { key: 'conflict_history', type: 'text', required: false },
        { key: 'agreement_willingness', type: 'single_select', required: true, options: [
          { value: 'absolutely', label: 'Absolutely', score: 3 },
          { value: 'open', label: 'Open to it', score: 2 },
          { value: 'maybe', label: 'Maybe', score: 1 },
          { value: 'probably_not', label: 'Probably not', score: 0 },
        ]},
        // Stage 6: Risk
        { key: 'life_changes', type: 'multi_select', required: true },
        { key: 'employment_stability', type: 'single_select', required: true, options: [
          { value: 'very_stable', label: 'Very stable', score: 3 },
          { value: 'stable', label: 'Stable', score: 2 },
          { value: 'uncertain', label: 'Uncertain', score: 1 },
          { value: 'unknown', label: 'Unknown', score: 0 },
        ]},
        { key: 'pause_factors', type: 'text', required: false },
        // Stage 7: Gut Check
        { key: 'trust_score', type: 'number', required: true, min: 1, max: 10 },
        { key: 'key_comfort', type: 'single_select', required: true, options: [
          { value: 'completely', label: 'Completely comfortable', score: 3 },
          { value: 'mostly', label: 'Mostly', score: 2 },
          { value: 'nervous', label: 'A bit nervous', score: 1 },
          { value: 'no', label: 'No', score: 0 },
        ]},
        { key: 'exit_conversation', type: 'single_select', required: true, options: [
          { value: 'definitely', label: 'Definitely', score: 3 },
          { value: 'probably', label: 'Probably', score: 2 },
          { value: 'unsure', label: 'Not sure', score: 1 },
          { value: 'worried', label: 'Worried', score: 0 },
        ]},
      ],
    },
    scoringRules: {
      method: 'weighted_sum',
      maxScore: 72,
      readinessWeight: 0.20,
      weights: {
        relationship_type: 1,
        relationship_duration: 1,
        lived_together: 1,
        roommate_context: 1,
        financial_awareness: 1,
        shared_finances: 1,
        money_personality: 1,
        financial_transparency: 1,
        lifestyle_sensitivities: 1,
        work_situation: 1,
        lifestyle_alignment: 1,
        substance_concerns: 1,
        timeline_alignment: 1,
        ownership_duration: 1,
        property_vision: 1,
        buyout_expectation: 1,
        conflict_style: 1,
        agreement_willingness: 1,
        employment_stability: 1,
        trust_score: 1,
        key_comfort: 1,
        exit_conversation: 1,
      },
    },
    displayOrder: 3,
    isRequired: false,
    estimatedMinutes: 10,
    isActive: true,
  },
]

// =============================================================================
// SEED
// =============================================================================

async function seed() {
  console.log('Seeding exercise templates...\n')

  for (const template of templates) {
    // Check if template exists
    const existing = await db
      .select({ id: exerciseTemplates.id })
      .from(exerciseTemplates)
      .where(eq(exerciseTemplates.slug, template.slug))
      .limit(1)

    if (existing.length > 0) {
      // Update existing
      await db
        .update(exerciseTemplates)
        .set({
          name: template.name,
          description: template.description,
          category: template.category,
          journeyStages: template.journeyStages,
          schema: template.schema,
          scoringRules: template.scoringRules,
          displayOrder: template.displayOrder,
          isRequired: template.isRequired,
          estimatedMinutes: template.estimatedMinutes,
          isActive: template.isActive,
        })
        .where(eq(exerciseTemplates.slug, template.slug))

      console.log(`  Updated: ${template.slug}`)
    } else {
      // Insert new
      await db.insert(exerciseTemplates).values({
        slug: template.slug,
        name: template.name,
        description: template.description,
        category: template.category,
        journeyStages: template.journeyStages,
        schema: template.schema,
        scoringRules: template.scoringRules,
        displayOrder: template.displayOrder,
        isRequired: template.isRequired,
        estimatedMinutes: template.estimatedMinutes,
        isActive: template.isActive,
      })

      console.log(`  Created: ${template.slug}`)
    }
  }

  console.log('\nDone! 3 exercise templates seeded.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
