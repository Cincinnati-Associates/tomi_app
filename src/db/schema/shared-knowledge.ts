import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { partyMembers } from './parties'

/**
 * Party Member Shared Data
 *
 * Tracks what individual data each party member has explicitly opted
 * to share with the group Homi and co-buyers. Data starts private
 * (in the user's individual Homi context) and moves here only through
 * deliberate user action.
 *
 * Design principles:
 * - No data is shared by default — every row represents an explicit opt-in
 * - Sharing is revocable (revoked_at) for pre-agreement data
 * - shared_via tracks provenance so the UI can show how/when data was shared
 * - The group Homi ONLY reads rows where revoked_at IS NULL
 *
 * See: docs/GROUP_KNOWLEDGE_ARCHITECTURE.md
 */
export const partyMemberSharedData = pgTable(
  'party_member_shared_data',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    partyMemberId: uuid('party_member_id')
      .references(() => partyMembers.id, { onDelete: 'cascade' })
      .notNull(),

    // What data category is being shared
    dataKey: text('data_key').notNull(), // e.g. "budget_range", "down_payment", "timeline"

    // The actual shared value
    dataValue: jsonb('data_value').notNull(), // structure depends on dataKey

    // How it was shared
    sharedVia: text('shared_via').notNull(), // "manual" | "journey_prompt" | "tic_drafting" | "chat_mention"

    // Lifecycle
    sharedAt: timestamp('shared_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_shared_data_party_member').on(table.partyMemberId),
    index('idx_shared_data_key').on(table.dataKey),
    // One active share per member per data key (can re-share after revoking)
    unique('shared_data_member_key_active').on(
      table.partyMemberId,
      table.dataKey,
    ),
  ]
)

// Relations defined in relations.ts to avoid circular imports

// Types
export type PartyMemberSharedData = typeof partyMemberSharedData.$inferSelect
export type NewPartyMemberSharedData = typeof partyMemberSharedData.$inferInsert

/**
 * Canonical data keys and their expected value shapes.
 * Used by assembleGroupKnowledge() and sharing UI.
 */
export const SHAREABLE_DATA_KEYS = {
  // Financial
  budget_range: 'budget_range',         // { low: number, high: number }
  down_payment: 'down_payment',         // { amount: number }
  monthly_limit: 'monthly_limit',       // { amount: number }
  income_range: 'income_range',         // { range: string } e.g. "100-150k"
  credit_tier: 'credit_tier',           // { tier: "excellent" | "good" | "fair" | "building" }

  // Preferences
  timeline: 'timeline',                 // { value: string } e.g. "6mo"
  location_preferences: 'location_preferences', // { areas: string[] }
  property_type: 'property_type',       // { types: string[] }
  deal_breakers: 'deal_breakers',       // { items: string[] }

  // Commitment
  ownership_split: 'ownership_split',   // { percentage: number }
  exit_preferences: 'exit_preferences', // { notice_period: string, buyout_method: string }
} as const

export type ShareableDataKey = keyof typeof SHAREABLE_DATA_KEYS
