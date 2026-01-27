import { relations } from 'drizzle-orm'
import { profiles } from './profiles'
import { buyingParties, partyMembers, partyInvites } from './parties'
import {
  visitorSessions,
  chatConversations,
  visitorUserLinks,
} from './chat'
import { userJourneys, userExerciseResponses } from './journey'
import { authAuditLogs } from './audit'

// =============================================================================
// APP-OWNED RELATIONS
// These relations define how app-owned tables relate to each other
// =============================================================================

// Profile relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  // Journey (1:1)
  journey: one(userJourneys, {
    fields: [profiles.id],
    references: [userJourneys.userId],
  }),
  // Parties
  createdParties: many(buyingParties),
  partyMemberships: many(partyMembers),
  sentInvites: many(partyInvites, { relationName: 'invitedBy' }),
  acceptedInvites: many(partyInvites, { relationName: 'acceptedBy' }),
  // Chat
  visitorSessions: many(visitorSessions),
  conversations: many(chatConversations),
  visitorLinks: many(visitorUserLinks),
  // Exercises
  exerciseResponses: many(userExerciseResponses),
  // Audit
  auditLogs: many(authAuditLogs),
}))

// Note: Buying party relations are already defined in parties.ts
// These are supplementary relations that reference other modules

// Journey relations (supplements journey.ts)
export const profileJourneyRelations = relations(userJourneys, ({ one }) => ({
  user: one(profiles, {
    fields: [userJourneys.userId],
    references: [profiles.id],
  }),
}))

// Exercise response to party relation (for hybrid exercises)
export const exerciseResponsePartyRelation = relations(
  userExerciseResponses,
  ({ one }) => ({
    group: one(buyingParties, {
      fields: [userExerciseResponses.groupId],
      references: [buyingParties.id],
    }),
  })
)

// Auth audit log relations
export const authAuditLogsRelations = relations(authAuditLogs, ({ one }) => ({
  user: one(profiles, {
    fields: [authAuditLogs.userId],
    references: [profiles.id],
  }),
}))
