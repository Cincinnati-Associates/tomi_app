export interface GroupChatMessage {
  id: string
  conversationId: string
  senderId: string | null
  senderName: string | null
  senderAvatar: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  channel: 'app' | 'imessage' | 'whatsapp' | 'telegram' | 'signal'
  metadata: Record<string, unknown>
  createdAt: string
}

export interface GroupConversationInfo {
  id: string
  partyId: string
  title: string
  customInstructions: string | null
  messageCount: number
  lastMessageAt: string | null
  lastMessagePreview: string | null
  members: GroupChatMember[]
  createdAt: string
}

export interface GroupChatMember {
  userId: string
  name: string
  avatarUrl: string | null
  role: string // party member role
  joinedAt: string
}

export interface GroupChatUnlockStatus {
  unlocked: boolean
  reason?: string
  checkinProgress?: {
    memberId: string
    memberName: string
    completed: boolean
  }[]
}
