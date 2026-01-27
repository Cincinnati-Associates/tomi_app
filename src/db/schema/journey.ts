import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import {
  journeyStageEnum,
  exerciseCategoryEnum,
  exerciseStatusEnum,
} from './enums'
import { profiles } from './profiles'
import { buyingParties } from './parties'

// =============================================================================
// USER JOURNEYS (PRD-002 §5.1)
// Tracks user's stage, readiness, and preferences for co-ownership
// =============================================================================

export const userJourneys = pgTable(
  'user_journeys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull()
      .unique(), // 1:1 with profiles

    // Journey stage
    stage: journeyStageEnum('stage').default('exploring').notNull(),

    // Readiness assessment (0-100)
    readinessScore: integer('readiness_score').default(0),

    // Timeline & preferences (PRD-002 §5.1)
    targetTimeline: varchar('target_timeline', { length: 50 }), // 3mo, 6mo, 12mo, 18mo+, exploring
    targetMarkets: jsonb('target_markets').default([]), // Array of metro area codes
    budgetRangeLow: integer('budget_range_low'),
    budgetRangeHigh: integer('budget_range_high'),
    coBuyerStatus: varchar('co_buyer_status', { length: 50 }), // has_cobuyers, seeking, open

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_user_journeys_stage').on(table.stage),
    index('idx_user_journeys_readiness').on(table.readinessScore),
  ]
)

// =============================================================================
// EXERCISE TEMPLATES (PRD-002 §5.2, PRD-003)
// Schema-driven exercise definitions rendered dynamically by frontend
// =============================================================================

export const exerciseTemplates = pgTable(
  'exercise_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 100 }).notNull().unique(), // e.g., "financial_readiness"

    // Display info
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    // Categorization
    category: exerciseCategoryEnum('category').notNull(), // individual, group, hybrid

    // Applicable journey stages (array of stage values)
    journeyStages: jsonb('journey_stages').default([]).notNull(),

    // JSON Schema for questions (PRD-003 format)
    schema: jsonb('schema').notNull(),

    // Scoring configuration
    scoringRules: jsonb('scoring_rules'),

    // Display & requirements
    displayOrder: integer('display_order').default(0),
    isRequired: boolean('is_required').default(false).notNull(),
    estimatedMinutes: integer('estimated_minutes'),
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_exercise_templates_slug').on(table.slug),
    index('idx_exercise_templates_category').on(table.category),
    index('idx_exercise_templates_active').on(table.isActive),
    index('idx_exercise_templates_order').on(table.displayOrder),
  ]
)

// =============================================================================
// USER EXERCISE RESPONSES (PRD-002 §5.3)
// User's answers to exercises with versioning for retakes
// =============================================================================

export const userExerciseResponses = pgTable(
  'user_exercise_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    exerciseId: uuid('exercise_id')
      .references(() => exerciseTemplates.id, { onDelete: 'cascade' })
      .notNull(),

    // Optional group context for hybrid exercises
    groupId: uuid('group_id').references(() => buyingParties.id, {
      onDelete: 'set null',
    }),

    // Response data
    responses: jsonb('responses').default({}).notNull(), // Answers per schema
    computedScores: jsonb('computed_scores').default({}), // Derived metrics

    // Status
    status: exerciseStatusEnum('status').default('in_progress').notNull(),

    // Timestamps
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),

    // Versioning for retakes
    version: integer('version').default(1).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_user_exercise_responses_user').on(table.userId),
    index('idx_user_exercise_responses_exercise').on(table.exerciseId),
    index('idx_user_exercise_responses_group').on(table.groupId),
    index('idx_user_exercise_responses_status').on(table.status),
    // Unique constraint: one active response per user/exercise/group combo per version
    unique('user_exercise_responses_user_exercise_version').on(
      table.userId,
      table.exerciseId,
      table.version
    ),
  ]
)

// =============================================================================
// RELATIONS
// =============================================================================

export const userJourneysRelations = relations(userJourneys, ({ one }) => ({
  user: one(profiles, {
    fields: [userJourneys.userId],
    references: [profiles.id],
  }),
}))

export const exerciseTemplatesRelations = relations(
  exerciseTemplates,
  ({ many }) => ({
    responses: many(userExerciseResponses),
  })
)

export const userExerciseResponsesRelations = relations(
  userExerciseResponses,
  ({ one }) => ({
    user: one(profiles, {
      fields: [userExerciseResponses.userId],
      references: [profiles.id],
    }),
    exercise: one(exerciseTemplates, {
      fields: [userExerciseResponses.exerciseId],
      references: [exerciseTemplates.id],
    }),
    group: one(buyingParties, {
      fields: [userExerciseResponses.groupId],
      references: [buyingParties.id],
    }),
  })
)

// =============================================================================
// TYPES
// =============================================================================

export type UserJourney = typeof userJourneys.$inferSelect
export type NewUserJourney = typeof userJourneys.$inferInsert
export type ExerciseTemplate = typeof exerciseTemplates.$inferSelect
export type NewExerciseTemplate = typeof exerciseTemplates.$inferInsert
export type UserExerciseResponse = typeof userExerciseResponses.$inferSelect
export type NewUserExerciseResponse = typeof userExerciseResponses.$inferInsert
