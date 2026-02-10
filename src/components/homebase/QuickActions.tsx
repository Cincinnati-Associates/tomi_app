"use client"

import { cn } from '@/lib/utils'
import type { QuickAction } from '@/hooks/useHomeBaseChat'

interface QuickActionsProps {
  actions: QuickAction[]
  onAction: (action: QuickAction) => void
  onUpload?: () => void
}

export function QuickActions({ actions, onAction, onUpload }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => {
            if (action.label === 'Upload a document' && onUpload) {
              onUpload()
            } else {
              onAction(action)
            }
          }}
          className={cn(
            'rounded-full border border-border bg-card px-4 py-2',
            'text-sm font-medium text-foreground',
            'hover:bg-primary/10 hover:border-primary/30 hover:text-primary',
            'transition-colors active:scale-95',
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
