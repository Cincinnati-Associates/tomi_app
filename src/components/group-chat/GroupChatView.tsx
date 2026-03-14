'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useGroupChat } from '@/hooks/useGroupChat'
import { GroupChatMessage } from './GroupChatMessage'
import { GroupChatParticipants } from './GroupChatParticipants'
import { GroupChatInput } from './GroupChatInput'
import { GroupChatLocked } from './GroupChatLocked'

interface GroupChatViewProps {
  partyId: string
}

export function GroupChatView({ partyId }: GroupChatViewProps) {
  const {
    messages,
    isLoading,
    isHomiResponding,
    unlockStatus,
    members,
    input,
    setInput,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    typingUsers,
    sendTypingIndicator,
  } = useGroupChat({ partyId })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length])

  // Infinite scroll up for history
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || !hasMoreMessages) return

    if (container.scrollTop < 100) {
      loadMoreMessages()
    }
  }, [hasMoreMessages, loadMoreMessages])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground text-sm">
          Loading group chat...
        </div>
      </div>
    )
  }

  // Locked state
  if (unlockStatus && !unlockStatus.unlocked) {
    return <GroupChatLocked status={unlockStatus} />
  }

  // Determine "current user" — we check if a message sender matches "You"
  // In a real app we'd pass the userId down, but for display purposes
  // we use the optimistic message marker.
  const shouldShowSender = (
    msg: (typeof messages)[0],
    idx: number
  ): boolean => {
    if (idx === 0) return true
    const prev = messages[idx - 1]
    return prev.senderId !== msg.senderId || prev.role !== msg.role
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-sm">Group Chat</h2>
            <p className="text-xs text-muted-foreground">
              {members.length} members
            </p>
          </div>
        </div>
        <GroupChatParticipants members={members} />
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-3"
      >
        {hasMoreMessages && (
          <div className="text-center py-2">
            <button
              onClick={loadMoreMessages}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-primary">H</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Welcome to your group chat! Message your co-buyers here, or type{' '}
              <span className="font-medium text-primary">@Homi</span> to ask
              Homi for help.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <GroupChatMessage
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderName === 'You'}
            showSender={shouldShowSender(msg, idx)}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions for empty state */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {[
              'What should we discuss?',
              'Review our exercise results',
              "What's next on our journey?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() =>
                  sendMessage(`@Homi ${suggestion}`)
                }
                className="text-xs px-3 py-1.5 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <GroupChatInput
        input={input}
        setInput={setInput}
        onSend={() => sendMessage()}
        onTyping={sendTypingIndicator}
        isHomiResponding={isHomiResponding}
        typingUsers={typingUsers}
      />
    </div>
  )
}
