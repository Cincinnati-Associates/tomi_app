"use client"

import { cn } from "@/lib/utils"
import type { TrailNodeStatus } from "@/lib/journey/types"

interface TrailConnectorProps {
  /** Status of the node BELOW this connector */
  statusBelow: TrailNodeStatus
}

export function TrailConnector({ statusBelow }: TrailConnectorProps) {
  const isCompleted = statusBelow === "completed"
  const isCurrent = statusBelow === "current"
  const isLocked = statusBelow === "locked"

  return (
    <div className="flex justify-center h-8 relative">
      <div
        className={cn(
          "w-0.5 h-full",
          isCompleted && "bg-primary",
          isCurrent && "bg-gradient-to-b from-primary to-muted",
          !isCompleted && !isCurrent && !isLocked && "border-l-2 border-dashed border-border",
          isLocked && "border-l-2 border-dashed border-border/30"
        )}
      />
      {/* Traveling dot for current connector */}
      {isCurrent && (
        <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary trail-dot-travel" />
      )}
    </div>
  )
}
