"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ConfiguratorProgressProps {
  stageNames: string[]
  currentStageIndex: number
  progress: number
  answeredCount: number
  totalCount: number
}

export function ConfiguratorProgress({
  stageNames,
  currentStageIndex,
  progress,
  answeredCount,
  totalCount,
}: ConfiguratorProgressProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Stage labels — hidden on mobile to save space */}
      <div className="hidden sm:flex items-center gap-1.5">
        {stageNames.map((name, i) => (
          <span
            key={name}
            className={cn(
              "text-xs font-medium transition-colors",
              i === currentStageIndex
                ? "text-primary"
                : i < currentStageIndex
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
            )}
          >
            {name}
            {i < stageNames.length - 1 && (
              <span className="text-muted-foreground/30 ml-1.5">·</span>
            )}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[80px]">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Counter */}
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {answeredCount}/{totalCount}
      </span>
    </div>
  )
}
