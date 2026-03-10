import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { groupMessageRoleEnum, messageChannelEnum } from './enums'
import { profiles } from './profiles'
import { buyingParties } from './parties'

// =============================================================================
// GROUP CONVERSATIONS
// One persistent conversation per party (V1). V2 adds threads via parent_conversation_id.
// =============================================================================

export const groupConversations = pgTable(
  'group_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partyId: uuid('party_id')
      .references(() => buyingParties.id, { onDelete: 'cascade' })
      .notNull(),
    parentConversationId: uuid('parent_conversation_id'),
    title: text('title').default('Main Chat').notNull(),
    customInstructions: text('custom_instructions'),
    channels: jsonb('channels').default(['app']).$type<string[]>(),
    messageCount: integer('message_count').default(0).notNull(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    lastMessagePreview: text('last_message_preview'),
    lastMessageSenderId: uuid('last_message_sender_id').references(
      () => profiles.id,
      { onDelete: 'set null' }
    ),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_group_conversations_party_id').on(table.partyId),
    // Note: partial unique index (one main conversation per party WHERE parent IS NULL)
    // is enforced in SQL migration, not expressible in Drizzle schema
  ]
)

// =============================================================================
// GROUP MESSAGES
// =============================================================================

export const groupMessages = pgTable(
  'group_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .references(() => groupConversations.id, { onDelete: 'cascade' })
      .notNull(),
    senderId: uuid('sender_id').references(() => profiles.id, {
      onDelete: 'set null',
    }),
    role: groupMessageRoleEnum('role').notNull(),
    content: text('content').notNull(),
    channel: messageChannelEnum('channel').default('app').notNull(),
    externalId: text('external_id'),
    channelMetadata: jsonb('channel_metadata').$type<Record<string, unknown>>(),
    metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_group_messages_conversation_created').on(
      table.conversationId,
      table.createdAt
    ),
    index('idx_group_messages_sender_id').on(table.senderId),
  ]
)

// =============================================================================
// GROUP CONVERSATION MEMBERS
// Tracks which users are in each conversation + read cursors
// =============================================================================

export const groupConversationMembers = pgTable(
  'group_conversation_members',
  {
    conversationId: uuid('conversation_id')
      .references(() => groupConversations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    lastReadMessageId: uuid('last_read_message_id').references(
      () => groupMessages.id,
      { onDelete: 'set null' }
    ),
    lastReadAt: timestamp('last_read_at', { withTimezone: true }),
    mutedUntil: timestamp('muted_until', { withTimezone: true }),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] }),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type GroupConversation = typeof groupConversations.$inferSelect
export type NewGroupConversation = typeof groupConversations.$inferInsert
export type GroupMessage = typeof groupMessages.$inferSelect
export type NewGroupMessage = typeof groupMessages.$inferInsert
export type GroupConversationMember =
  typeof groupConversationMembers.$inferSelect
export type NewGroupConversationMember =
  typeof groupConversationMembers.$inferInsert
