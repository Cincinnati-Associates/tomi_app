"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Clock, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExerciseContextPanelProps {
  stages: string[]
  currentStageIndex: number
  answers: Record<string, unknown>
  /** Maps question key -> chip value -> display label */
  answerLabels?: Record<string, Record<string, string>>
  /** Maps question key -> human-readable name */
  questionNames?: Record<string, string>
  totalQuestions: number
  answeredCount: number
  estimatedMinutes: number
}

export function ExerciseContextPanel({
  stages,
  currentStageIndex,
  answers,
  answerLabels = {},
  questionNames = {},
  totalQuestions,
  answeredCount,
  estimatedMinutes,
}: ExerciseContextPanelProps) {
  const progress = totalQuestions > 0 ? answeredCount / totalQuestions : 0
  const remainingMinutes = Math.max(
    1,
    Math.round(estimatedMinutes * (1 - progress))
  )

  // Build display entries from answers
  const answerEntries = Object.entries(answers)
    .filter(([, value]) => value !== undefined && value !== null && value !== "(skipped)")
    .map(([key, value]) => {
      const name = questionNames[key] || key
      const labelMap = answerLabels[key]
      let displayValue: string

      if (labelMap && typeof value === "string" && labelMap[value]) {
        displayValue = labelMap[value]
      } else if (typeof value === "string") {
        // Truncate long free-text answers
        displayValue = value.length > 60 ? value.slice(0, 57) + "..." : value
      } else {
        displayValue = String(value)
      }

      return { key, name, displayValue }
    })

  return (
    <div className="flex flex-col h-full p-5 overflow-y-auto">
      {/* Progress ring */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative h-10 w-10 flex-shrink-0">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-muted"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-primary transition-all duration-500"
              strokeWidth="3"
              strokeDasharray={`${progress * 97.4} 97.4`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {answeredCount} of {totalQuestions} questions
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ~{remainingMinutes} min remaining
          </p>
        </div>
      </div>

      {/* Stage checklist */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Sections
        </h3>
        <div className="space-y-2">
          {stages.map((stage, i) => {
            const isComplete = i < currentStageIndex
            const isCurrent = i === currentStageIndex
            return (
              <div
                key={stage}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isCurrent && "bg-primary/10 text-foreground font-medium",
                  isComplete && "text-muted-foreground",
                  !isCurrent && !isComplete && "text-muted-foreground/60"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 flex-shrink-0 opacity-40" />
                )}
                {stage}
              </div>
            )
          })}
        </div>
      </div>

      {/* Answer summary */}
      <AnimatePresence mode="popLayout">
        {answerEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Your answers
            </h3>
            <div className="space-y-2">
              {answerEntries.map((entry) => (
                <motion.div
                  key={entry.key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-baseline justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {entry.name}
                  </span>
                  <span className="text-sm font-medium text-foreground text-right truncate">
                    {entry.displayValue}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
