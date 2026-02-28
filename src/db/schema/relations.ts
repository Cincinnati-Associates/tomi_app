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
import {
  homeDocuments,
  homeDocumentChunks,
  homeProjects,
  homeTasks,
  homeTaskComments,
  homeLabels,
  homeTaskLabels,
  homeTaskActivity,
} from './homebase'
import { emailSends, emailSequences } from './email'

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

// =============================================================================
// HOMEBASE RELATIONS
// =============================================================================

export const homeDocumentsRelations = relations(homeDocuments, ({ one, many }) => ({
  party: one(buyingParties, {
    fields: [homeDocuments.partyId],
    references: [buyingParties.id],
  }),
  uploadedByProfile: one(profiles, {
    fields: [homeDocuments.uploadedBy],
    references: [profiles.id],
  }),
  chunks: many(homeDocumentChunks),
}))

export const homeDocumentChunksRelations = relations(homeDocumentChunks, ({ one }) => ({
  document: one(homeDocuments, {
    fields: [homeDocumentChunks.documentId],
    references: [homeDocuments.id],
  }),
}))

export const homeProjectsRelations = relations(homeProjects, ({ one, many }) => ({
  party: one(buyingParties, {
    fields: [homeProjects.partyId],
    references: [buyingParties.id],
  }),
  createdByProfile: one(profiles, {
    fields: [homeProjects.createdBy],
    references: [profiles.id],
    relationName: 'projectCreator',
  }),
  ownerProfile: one(profiles, {
    fields: [homeProjects.ownerId],
    references: [profiles.id],
    relationName: 'projectOwner',
  }),
  tasks: many(homeTasks),
}))

export const homeTasksRelations = relations(homeTasks, ({ one, many }) => ({
  party: one(buyingParties, {
    fields: [homeTasks.partyId],
    references: [buyingParties.id],
  }),
  project: one(homeProjects, {
    fields: [homeTasks.projectId],
    references: [homeProjects.id],
  }),
  parentTask: one(homeTasks, {
    fields: [homeTasks.parentTaskId],
    references: [homeTasks.id],
    relationName: 'subtasks',
  }),
  subtasks: many(homeTasks, { relationName: 'subtasks' }),
  createdByProfile: one(profiles, {
    fields: [homeTasks.createdBy],
    references: [profiles.id],
    relationName: 'taskCreator',
  }),
  assignedToProfile: one(profiles, {
    fields: [homeTasks.assignedTo],
    references: [profiles.id],
    relationName: 'taskAssignee',
  }),
  completedByProfile: one(profiles, {
    fields: [homeTasks.completedBy],
    references: [profiles.id],
    relationName: 'taskCompleter',
  }),
  comments: many(homeTaskComments),
  taskLabels: many(homeTaskLabels),
  activity: many(homeTaskActivity),
}))

export const homeTaskCommentsRelations = relations(homeTaskComments, ({ one }) => ({
  task: one(homeTasks, {
    fields: [homeTaskComments.taskId],
    references: [homeTasks.id],
  }),
  author: one(profiles, {
    fields: [homeTaskComments.authorId],
    references: [profiles.id],
  }),
}))

export const homeLabelsRelations = relations(homeLabels, ({ one, many }) => ({
  party: one(buyingParties, {
    fields: [homeLabels.partyId],
    references: [buyingParties.id],
  }),
  taskLabels: many(homeTaskLabels),
}))

export const homeTaskLabelsRelations = relations(homeTaskLabels, ({ one }) => ({
  task: one(homeTasks, {
    fields: [homeTaskLabels.taskId],
    references: [homeTasks.id],
  }),
  label: one(homeLabels, {
    fields: [homeTaskLabels.labelId],
    references: [homeLabels.id],
  }),
}))

export const homeTaskActivityRelations = relations(homeTaskActivity, ({ one }) => ({
  task: one(homeTasks, {
    fields: [homeTaskActivity.taskId],
    references: [homeTasks.id],
  }),
  actor: one(profiles, {
    fields: [homeTaskActivity.actorId],
    references: [profiles.id],
  }),
}))

// =============================================================================
// EMAIL RELATIONS
// =============================================================================

export const emailSendsRelations = relations(emailSends, ({ one }) => ({
  user: one(profiles, {
    fields: [emailSends.userId],
    references: [profiles.id],
  }),
}))

export const emailSequencesRelations = relations(emailSequences, ({ one }) => ({
  user: one(profiles, {
    fields: [emailSequences.userId],
    references: [profiles.id],
  }),
  emailSend: one(emailSends, {
    fields: [emailSequences.emailSendId],
    references: [emailSends.id],
  }),
}))
