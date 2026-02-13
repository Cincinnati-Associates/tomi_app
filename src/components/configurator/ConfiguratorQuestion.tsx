"use client"

import { useCallback } from "react"
import { QuickReplyChips } from "@/components/exercise-chat/QuickReplyChips"
import { NumberScale } from "@/components/exercise-chat/NumberScale"
import type { FlatQuestion } from "@/hooks/useConfiguratorExercise"

interface ConfiguratorQuestionProps {
  question: FlatQuestion
  answer: unknown
  onAnswer: (key: string, value: unknown) => void
  subtext?: string
}

export function ConfiguratorQuestion({
  question,
  answer,
  onAnswer,
  subtext,
}: ConfiguratorQuestionProps) {
  const handleChipSelect = useCallback(
    (value: string) => {
      onAnswer(question.key, value)
    },
    [question.key, onAnswer]
  )

  const handleNumberSelect = useCallback(
    (value: number) => {
      onAnswer(question.key, value)
    },
    [question.key, onAnswer]
  )

  return (
    <div>
      {/* Question prompt */}
      <h3 className="text-lg sm:text-xl font-medium text-foreground mb-5">
        {question.prompt}
      </h3>

      {/* Input */}
      {(question.type === "chips" || question.type === "multi_chips") &&
        question.options && (
          <QuickReplyChips
            options={question.options}
            selected={(answer as string | string[]) ?? null}
            onSelect={handleChipSelect}
            multiSelect={question.type === "multi_chips"}
          />
        )}

      {question.type === "number_scale" && (
        <NumberScale
          min={question.min}
          max={question.max}
          selected={(answer as number) ?? null}
          onSelect={handleNumberSelect}
        />
      )}

      {/* Educational subtext */}
      {subtext && (
        <p className="mt-4 text-xs text-muted-foreground/80 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  )
}
