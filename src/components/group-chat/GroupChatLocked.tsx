'use client'

import type { GroupChatUnlockStatus } from '@/lib/group-chat/types'

interface GroupChatLockedProps {
  status: GroupChatUnlockStatus
}

export function GroupChatLocked({ status }: GroupChatLockedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 text-primary/60"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">Group Chat Locked</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        {status.reason ||
          'Complete the required exercises to unlock group chat with your co-buyers.'}
      </p>

      {status.checkinProgress && status.checkinProgress.length > 0 && (
        <div className="mt-6 w-full max-w-xs">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            Co-Buyer Check-In Progress
          </p>
          <div className="space-y-2">
            {status.checkinProgress.map((item) => (
              <div
                key={item.memberId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="text-sm">{item.memberName}</span>
                {item.completed ? (
                  <span className="text-xs text-green-600 font-medium">
                    Complete
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
