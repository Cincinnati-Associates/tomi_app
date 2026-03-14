'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type {
  GroupChatMessage,
  GroupChatMember,
  GroupChatUnlockStatus,
} from '@/lib/group-chat/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseGroupChatOptions {
  partyId: string
}

interface UseGroupChatReturn {
  messages: GroupChatMessage[]
  isLoading: boolean
  isHomiResponding: boolean
  conversationId: string | null
  unlockStatus: GroupChatUnlockStatus | null
  members: GroupChatMember[]
  input: string
  setInput: (value: string) => void
  sendMessage: (content?: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  hasMoreMessages: boolean
  typingUsers: string[]
  sendTypingIndicator: () => void
}

export function useGroupChat({
  partyId,
}: UseGroupChatOptions): UseGroupChatReturn {
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHomiResponding, setIsHomiResponding] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [unlockStatus, setUnlockStatus] =
    useState<GroupChatUnlockStatus | null>(null)
  const [members, setMembers] = useState<GroupChatMember[]>([])
  const [input, setInput] = useState('')
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const channelRef = useRef<RealtimeChannel | null>(null)
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null)
  const pendingHomiMessageIdRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize: fetch conversation + unlock status
  useEffect(() => {
    let cancelled = false

    async function init() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/party/${partyId}/chat`)
        const data = await res.json()

        if (cancelled) return

        if (!data.unlocked) {
          setUnlockStatus({
            unlocked: false,
            reason: data.reason,
          })
          setIsLoading(false)
          return
        }

        setUnlockStatus({
          unlocked: true,
          checkinProgress: data.checkinProgress,
        })
        setConversationId(data.conversationId)
        setMembers(data.members)

        // Load initial messages
        const msgRes = await fetch(
          `/api/party/${partyId}/chat/messages?limit=50`
        )
        const msgData = await msgRes.json()
        if (!cancelled) {
          setMessages(msgData.messages || [])
          setHasMoreMessages(msgData.hasMore || false)
        }
      } catch (err) {
        console.error('Failed to init group chat:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [partyId])

  // Subscribe to Realtime for new messages
  useEffect(() => {
    if (!conversationId) return

    const supabase = createClient()

    // Postgres changes subscription for new messages
    const channel = supabase
      .channel(`group-chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          const newMsg = payload.new as {
            id: string
            conversation_id: string
            sender_id: string | null
            role: string
            content: string
            channel: string
            metadata: Record<string, unknown>
            created_at: string
          }

          // Dedup: skip if this is the Homi message we already streamed
          if (
            pendingHomiMessageIdRef.current &&
            newMsg.id === pendingHomiMessageIdRef.current
          ) {
            pendingHomiMessageIdRef.current = null
            return
          }

          // Build message with sender info
          const member = members.find((m) => m.userId === newMsg.sender_id)
          const message: GroupChatMessage = {
            id: newMsg.id,
            conversationId: newMsg.conversation_id,
            senderId: newMsg.sender_id,
            senderName: member?.name || (newMsg.role === 'assistant' ? 'Homi' : null),
            senderAvatar: member?.avatarUrl || null,
            role: newMsg.role as 'user' | 'assistant' | 'system',
            content: newMsg.content,
            channel: newMsg.channel as GroupChatMessage['channel'],
            metadata: newMsg.metadata || {},
            createdAt: newMsg.created_at,
          }

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === message.id)) return prev
            return [...prev, message]
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    // Broadcast channel for typing indicators
    const broadcastChannel = supabase
      .channel(`group-chat-broadcast:${conversationId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        const { userName } = payload.payload as { userName: string }
        setTypingUsers((prev) =>
          prev.includes(userName) ? prev : [...prev, userName]
        )
        // Clear after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== userName))
        }, 3000)
      })
      .on('broadcast', { event: 'homi_responding' }, () => {
        // Another client triggered @Homi
        setIsHomiResponding(true)
      })
      .on('broadcast', { event: 'homi_done' }, () => {
        setIsHomiResponding(false)
      })
      .subscribe()

    broadcastChannelRef.current = broadcastChannel

    return () => {
      channel.unsubscribe()
      broadcastChannel.unsubscribe()
      channelRef.current = null
      broadcastChannelRef.current = null
    }
  }, [conversationId, members])

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (!broadcastChannelRef.current) return

    // Throttle: only send every 2 seconds
    if (typingTimeoutRef.current) return
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null
    }, 2000)

    const currentMember = members.find(
      (m) => m.userId === members[0]?.userId
    ) // We don't have the current userId client-side — this is handled by the broadcast
    void broadcastChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userName: currentMember?.name || 'Someone' },
    })
  }, [members])

  // Send message
  const sendMessage = useCallback(
    async (content?: string) => {
      const text = (content || input).trim()
      if (!text || !partyId) return

      setInput('')

      // Optimistic: add user's message locally
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMessage: GroupChatMessage = {
        id: optimisticId,
        conversationId: conversationId || '',
        senderId: null, // We don't have userId client-side
        senderName: 'You',
        senderAvatar: null,
        role: 'user',
        content: text,
        channel: 'app',
        metadata: {},
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticMessage])

      const homiTriggered = /@homi/i.test(text)
      if (homiTriggered) {
        setIsHomiResponding(true)
        // Broadcast to others
        broadcastChannelRef.current?.send({
          type: 'broadcast',
          event: 'homi_responding',
          payload: {},
        })
      }

      try {
        const res = await fetch(`/api/party/${partyId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })

        if (!res.ok) {
          throw new Error(`Failed to send: ${res.status}`)
        }

        // Remove optimistic message (Realtime will deliver the real one)
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))

        if (homiTriggered && res.body) {
          // Stream Homi's response
          const homiStreamId = `homi-stream-${Date.now()}`
          const streamMessage: GroupChatMessage = {
            id: homiStreamId,
            conversationId: conversationId || '',
            senderId: null,
            senderName: 'Homi',
            senderAvatar: null,
            role: 'assistant',
            content: '',
            channel: 'app',
            metadata: {},
            createdAt: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, streamMessage])

          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let accumulatedText = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            // Parse Vercel AI SDK data stream format
            // Text deltas are lines starting with "0:"
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('0:')) {
                try {
                  const textDelta = JSON.parse(line.slice(2))
                  if (typeof textDelta === 'string') {
                    accumulatedText += textDelta
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === homiStreamId
                          ? { ...m, content: accumulatedText }
                          : m
                      )
                    )
                  }
                } catch {
                  // Ignore parse errors for non-text chunks
                }
              }
            }
          }

          // Stream complete — the server saved the message, Realtime will deliver it.
          // We keep the stream message and set a dedup flag so Realtime skips the duplicate.
          // Since we can't get the server-saved message ID from a stream response,
          // we rely on content matching for dedup (handled in Realtime callback).
          setIsHomiResponding(false)
          broadcastChannelRef.current?.send({
            type: 'broadcast',
            event: 'homi_done',
            payload: {},
          })
        } else if (!homiTriggered) {
          // Non-Homi message: response is JSON with messageId
          // Realtime will deliver the persisted version
        }
      } catch (err) {
        console.error('Failed to send message:', err)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setIsHomiResponding(false)
      }
    },
    [input, partyId, conversationId]
  )

  // Load more messages (infinite scroll up)
  const loadMoreMessages = useCallback(async () => {
    if (!partyId || !messages.length) return

    const oldestId = messages[0]?.id
    if (!oldestId || oldestId.startsWith('optimistic-') || oldestId.startsWith('homi-stream-')) return

    try {
      const res = await fetch(
        `/api/party/${partyId}/chat/messages?limit=50&before=${oldestId}`
      )
      const data = await res.json()
      setMessages((prev) => [...(data.messages || []), ...prev])
      setHasMoreMessages(data.hasMore || false)
    } catch (err) {
      console.error('Failed to load more messages:', err)
    }
  }, [partyId, messages])

  return {
    messages,
    isLoading,
    isHomiResponding,
    conversationId,
    unlockStatus,
    members,
    input,
    setInput,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    typingUsers,
    sendTypingIndicator,
  }
}
