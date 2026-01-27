import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { visitorStageEnum, chatRoleEnum } from './enums'
import { profiles } from './profiles'
import { buyingParties } from './parties'

// Visitor Sessions (anonymous pre-signup users)
export const visitorSessions = pgTable(
  'visitor_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    visitorId: uuid('visitor_id').notNull(), // Persistent across sessions
    sessionId: uuid('session_id').notNull(), // Per-session

    // Identity
    firstName: text('first_name'),
    identityConfirmed: boolean('identity_confirmed').default(false),

    // Journey stage
    stage: visitorStageEnum('stage').default('explorer').notNull(),

    // Volunteered info (bucketed, non-PII)
    volunteeredInfo: jsonb('volunteered_info').default('{}'),

    // Behavioral metrics
    behavior: jsonb('behavior').default('{}'),

    // Chat summary (AI-generated)
    chatSummary: text('chat_summary'),
    chatTopics: text('chat_topics').array(),
    chatSentiment: text('chat_sentiment'),
    qualificationSignals: jsonb('qualification_signals').default('{}'),

    // Timestamps
    firstSeen: timestamp('first_seen', { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeen: timestamp('last_seen', { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Link to user if they sign up
    linkedUserId: uuid('linked_user_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    linkedAt: timestamp('linked_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_visitor_sessions_visitor_id').on(table.visitorId),
    index('idx_visitor_sessions_linked_user').on(table.linkedUserId),
    index('idx_visitor_sessions_stage').on(table.stage),
    index('idx_visitor_sessions_last_seen').on(table.lastSeen),
  ]
)

// Chat Conversations (for authenticated users)
export const chatConversations = pgTable(
  'chat_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    partyId: uuid('party_id').references(() => buyingParties.id, {
      onDelete: 'set null',
    }),

    // Metadata
    title: text('title'),
    startedAt: timestamp('started_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    messageCount: integer('message_count').default(0).notNull(),

    // Analytics
    topicsDiscussed: text('topics_discussed').array(),
    sentiment: text('sentiment'),

    // Summarized context
    summary: text('summary'),
    // Note: summary_embedding uses pgvector which needs special handling

    // Status
    isArchived: boolean('is_archived').default(false).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_chat_conversations_user_id').on(table.userId),
    index('idx_chat_conversations_party_id').on(table.partyId),
    index('idx_chat_conversations_last_message').on(table.lastMessageAt),
  ]
)

// Chat Messages
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .references(() => chatConversations.id, { onDelete: 'cascade' })
      .notNull(),

    // Message content
    role: chatRoleEnum('role').notNull(),
    content: text('content').notNull(),

    // Optional metadata
    metadata: jsonb('metadata').default('{}'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_chat_messages_conversation_id').on(table.conversationId),
    index('idx_chat_messages_created_at').on(table.createdAt),
  ]
)

// Visitor-User Links
export const visitorUserLinks = pgTable(
  'visitor_user_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    visitorId: uuid('visitor_id').notNull(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    mergedContext: jsonb('merged_context'),
    linkedAt: timestamp('linked_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_visitor_user_links_visitor').on(table.visitorId),
    index('idx_visitor_user_links_user').on(table.userId),
    unique('visitor_user_links_unique').on(table.visitorId, table.userId),
  ]
)

// Relations
export const visitorSessionsRelations = relations(visitorSessions, ({ one }) => ({
  linkedUser: one(profiles, {
    fields: [visitorSessions.linkedUserId],
    references: [profiles.id],
  }),
}))

export const chatConversationsRelations = relations(
  chatConversations,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [chatConversations.userId],
      references: [profiles.id],
    }),
    party: one(buyingParties, {
      fields: [chatConversations.partyId],
      references: [buyingParties.id],
    }),
    messages: many(chatMessages),
  })
)

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}))

export const visitorUserLinksRelations = relations(visitorUserLinks, ({ one }) => ({
  user: one(profiles, {
    fields: [visitorUserLinks.userId],
    references: [profiles.id],
  }),
}))

// Types
export type VisitorSession = typeof visitorSessions.$inferSelect
export type NewVisitorSession = typeof visitorSessions.$inferInsert
export type ChatConversation = typeof chatConversations.$inferSelect
export type NewChatConversation = typeof chatConversations.$inferInsert
export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
export type VisitorUserLink = typeof visitorUserLinks.$inferSelect
export type NewVisitorUserLink = typeof visitorUserLinks.$inferInsert
