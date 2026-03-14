'use client'

import type { GroupChatMember } from '@/lib/group-chat/types'

interface GroupChatParticipantsProps {
  members: GroupChatMember[]
  maxVisible?: number
}

export function GroupChatParticipants({
  members,
  maxVisible = 4,
}: GroupChatParticipantsProps) {
  const visible = members.slice(0, maxVisible)
  const overflow = members.length - maxVisible

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((member) => (
        <div
          key={member.userId}
          className="relative w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden"
          title={member.name}
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              {member.name[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">
            +{overflow}
          </span>
        </div>
      )}
    </div>
  )
}
