"use client"

import { cn } from "@/lib/utils"

interface StageProgressProps {
  stages: string[]
  currentStageIndex: number
}

export function StageProgress({ stages, currentStageIndex }: StageProgressProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i <= currentStageIndex
                ? "bg-primary w-6"
                : "bg-muted w-2"
            )}
          />
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        {currentStageIndex + 1}/{stages.length}
      </span>
    </div>
  )
}
