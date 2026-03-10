import {
  db,
  groupConversations,
  groupMessages,
  groupConversationMembers,
  profiles,
  partyMembers,
} from '@/db'
import { eq, and, desc, lt, sql } from 'drizzle-orm'
import type { CoreMessage } from 'ai'
import type { GroupChatMessage } from './types'

/**
 * Get or create the main conversation for a party.
 * Uses the unique partial index to enforce one main conversation per party.
 */
export async function getOrCreateMainConversation(
  partyId: string
): Promise<string> {
  // Try to find existing
  const existing = await db.query.groupConversations.findFirst({
    where: and(
      eq(groupConversations.partyId, partyId),
      sql`${groupConversations.parentConversationId} IS NULL`
    ),
  })
  if (existing) return existing.id

  // Create new (the unique partial index prevents races)
  const [conversation] = await db
    .insert(groupConversations)
    .values({ partyId, title: 'Main Chat' })
    .onConflictDoNothing()
    .returning({ id: groupConversations.id })

  // If conflict, re-fetch
  if (!conversation) {
    const refetch = await db.query.groupConversations.findFirst({
      where: and(
        eq(groupConversations.partyId, partyId),
        sql`${groupConversations.parentConversationId} IS NULL`
      ),
    })
    return refetch!.id
  }

  return conversation.id
}

/**
 * Ensure a user is a member of the conversation.
 * Upsert to avoid duplicates.
 */
export async function ensureConversationMember(
  conversationId: string,
  userId: string
): Promise<void> {
  await db
    .insert(groupConversationMembers)
    .values({ conversationId, userId })
    .onConflictDoNothing()
}

/**
 * Save a message to the group conversation.
 * Updates denormalized stats on the conversation.
 */
export async function saveGroupMessage({
  conversationId,
  senderId,
  role,
  content,
  channel = 'app',
  metadata = {},
}: {
  conversationId: string
  senderId: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  channel?: 'app' | 'imessage' | 'whatsapp' | 'telegram' | 'signal'
  metadata?: Record<string, unknown>
}): Promise<string> {
  const [message] = await db
    .insert(groupMessages)
    .values({ conversationId, senderId, role, content, channel, metadata })
    .returning({ id: groupMessages.id })

  // Update denormalized stats
  await db
    .update(groupConversations)
    .set({
      messageCount: sql`${groupConversations.messageCount} + 1`,
      lastMessageAt: sql`now()`,
      lastMessagePreview: content.slice(0, 100),
      lastMessageSenderId: senderId,
      updatedAt: sql`now()`,
    })
    .where(eq(groupConversations.id, conversationId))

  return message.id
}

/**
 * Load messages with sender profile info, cursor-paginated.
 */
export async function loadGroupMessages(
  conversationId: string,
  opts: { limit?: number; before?: string } = {}
): Promise<GroupChatMessage[]> {
  const { limit = 50, before } = opts

  const conditions = [eq(groupMessages.conversationId, conversationId)]
  if (before) {
    // Get the created_at of the cursor message
    const cursorMsg = await db.query.groupMessages.findFirst({
      where: eq(groupMessages.id, before),
      columns: { createdAt: true },
    })
    if (cursorMsg) {
      conditions.push(lt(groupMessages.createdAt, cursorMsg.createdAt))
    }
  }

  const rows = await db
    .select({
      id: groupMessages.id,
      conversationId: groupMessages.conversationId,
      senderId: groupMessages.senderId,
      senderName: profiles.fullName,
      senderAvatar: profiles.avatarUrl,
      role: groupMessages.role,
      content: groupMessages.content,
      channel: groupMessages.channel,
      metadata: groupMessages.metadata,
      createdAt: groupMessages.createdAt,
    })
    .from(groupMessages)
    .leftJoin(profiles, eq(groupMessages.senderId, profiles.id))
    .where(and(...conditions))
    .orderBy(desc(groupMessages.createdAt))
    .limit(limit)

  // Reverse to chronological order
  return rows.reverse().map((r) => ({
    id: r.id,
    conversationId: r.conversationId,
    senderId: r.senderId,
    senderName: r.senderName,
    senderAvatar: r.senderAvatar,
    role: r.role,
    content: r.content,
    channel: r.channel,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    createdAt: r.createdAt.toISOString(),
  }))
}

/**
 * Convert DB messages to AI-ready format with [Name] prefixes for user messages.
 */
export function formatMessagesForAI(
  messages: GroupChatMessage[]
): CoreMessage[] {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (m.role === 'user') {
        const name = m.senderName || 'Unknown'
        return {
          role: 'user' as const,
          content: `[${name}]: ${m.content}`,
        }
      }
      return {
        role: 'assistant' as const,
        content: m.content,
      }
    })
}

/**
 * Update the read cursor for a member.
 */
export async function updateReadCursor(
  conversationId: string,
  userId: string,
  messageId: string
): Promise<void> {
  await db
    .update(groupConversationMembers)
    .set({
      lastReadMessageId: messageId,
      lastReadAt: sql`now()`,
    })
    .where(
      and(
        eq(groupConversationMembers.conversationId, conversationId),
        eq(groupConversationMembers.userId, userId)
      )
    )
}

/**
 * Get all accepted party members with profile info.
 */
export async function getPartyMembersWithProfiles(partyId: string) {
  return db.query.partyMembers.findMany({
    where: and(
      eq(partyMembers.partyId, partyId),
      eq(partyMembers.inviteStatus, 'accepted')
    ),
    with: { user: true },
  })
}
