import {
  pgTable,
  uuid,
  text,
  numeric,
  jsonb,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import {
  partyStatusEnum,
  memberRoleEnum,
  inviteStatusEnum,
  inviteTypeEnum,
} from './enums'
import { profiles } from './profiles'

// Buying Parties (co-buying groups)
export const buyingParties = pgTable(
  'buying_parties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    status: partyStatusEnum('status').default('forming').notNull(),
    createdBy: uuid('created_by').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    calculatorState: jsonb('calculator_state'),
    targetCity: text('target_city'),
    targetBudget: numeric('target_budget'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_buying_parties_status').on(table.status),
    index('idx_buying_parties_created_by').on(table.createdBy),
  ]
)

// Party Members (junction table)
export const partyMembers = pgTable(
  'party_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partyId: uuid('party_id')
      .references(() => buyingParties.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    role: memberRoleEnum('role').default('member').notNull(),
    inviteStatus: inviteStatusEnum('invite_status').default('accepted').notNull(),
    ownershipPercentage: numeric('ownership_percentage'),
    downPaymentContribution: numeric('down_payment_contribution'),
    monthlyContribution: numeric('monthly_contribution'),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_party_members_user_id').on(table.userId),
    index('idx_party_members_party_id').on(table.partyId),
    unique('party_members_party_user_unique').on(table.partyId, table.userId),
  ]
)

// Party Invites
export const partyInvites = pgTable(
  'party_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partyId: uuid('party_id')
      .references(() => buyingParties.id, { onDelete: 'cascade' })
      .notNull(),
    inviteType: inviteTypeEnum('invite_type').notNull(),
    inviteValue: text('invite_value').notNull(), // email, phone, or token
    invitedBy: uuid('invited_by').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    role: memberRoleEnum('role').default('member').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    acceptedBy: uuid('accepted_by').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_party_invites_party_id').on(table.partyId),
    index('idx_party_invites_value').on(table.inviteValue),
    index('idx_party_invites_expires').on(table.expiresAt),
  ]
)

// Relations
export const buyingPartiesRelations = relations(buyingParties, ({ one, many }) => ({
  createdByProfile: one(profiles, {
    fields: [buyingParties.createdBy],
    references: [profiles.id],
  }),
  members: many(partyMembers),
  invites: many(partyInvites),
}))

export const partyMembersRelations = relations(partyMembers, ({ one }) => ({
  party: one(buyingParties, {
    fields: [partyMembers.partyId],
    references: [buyingParties.id],
  }),
  user: one(profiles, {
    fields: [partyMembers.userId],
    references: [profiles.id],
  }),
}))

export const partyInvitesRelations = relations(partyInvites, ({ one }) => ({
  party: one(buyingParties, {
    fields: [partyInvites.partyId],
    references: [buyingParties.id],
  }),
  invitedByProfile: one(profiles, {
    fields: [partyInvites.invitedBy],
    references: [profiles.id],
  }),
  acceptedByProfile: one(profiles, {
    fields: [partyInvites.acceptedBy],
    references: [profiles.id],
  }),
}))

// Types
export type BuyingParty = typeof buyingParties.$inferSelect
export type NewBuyingParty = typeof buyingParties.$inferInsert
export type PartyMember = typeof partyMembers.$inferSelect
export type NewPartyMember = typeof partyMembers.$inferInsert
export type PartyInvite = typeof partyInvites.$inferSelect
export type NewPartyInvite = typeof partyInvites.$inferInsert
