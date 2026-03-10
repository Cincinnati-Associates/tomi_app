'use client'

import { cn } from '@/lib/utils'
import type { GroupChatMessage as GroupChatMessageType } from '@/lib/group-chat/types'

interface GroupChatMessageProps {
  message: GroupChatMessageType
  isCurrentUser: boolean
  showSender: boolean
}

export function GroupChatMessage({
  message,
  isCurrentUser,
  showSender,
}: GroupChatMessageProps) {
  // System messages
  if (message.role === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground italic">
          {message.content}
        </span>
      </div>
    )
  }

  const isHomi = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex gap-2 px-4',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar for non-current-user messages */}
      {!isCurrentUser && (
        <div className="flex-shrink-0 mt-1">
          {isHomi ? (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">H</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {message.senderAvatar ? (
                <img
                  src={message.senderAvatar}
                  alt={message.senderName || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {(message.senderName || '?')[0].toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          'flex flex-col max-w-[75%]',
          isCurrentUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name */}
        {showSender && !isCurrentUser && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {isHomi ? 'Homi' : message.senderName || 'Unknown'}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm leading-relaxed',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : isHomi
                ? 'bg-primary/10 text-foreground border border-primary/20 rounded-bl-md'
                : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/60 mt-0.5 px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (diffDays === 0) return time
  if (diffDays === 1) return `Yesterday ${time}`
  if (diffDays < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${time}`
  }
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time}`
}
