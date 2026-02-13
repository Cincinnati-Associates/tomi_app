"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import type {
  ExerciseStageDef,
  ExerciseQuestionDef,
} from "@/hooks/useConversationalExercise"

// =============================================================================
// TYPES
// =============================================================================

export interface FlatQuestion {
  key: string
  prompt: string
  type: ExerciseQuestionDef["type"]
  options?: ExerciseQuestionDef["options"]
  min?: number
  max?: number
  skipLabel?: string
  stageName: string
  stageIndex: number
  questionIndex: number
  globalIndex: number
}

export interface UseConfiguratorExerciseOptions<TVisualState = Record<string, unknown>> {
  exerciseSlug: string
  stages: ExerciseStageDef[]
  onComplete: (answers: Record<string, unknown>) => void
  savedAnswers?: Record<string, unknown>
  visualMapping?: (answers: Record<string, unknown>) => TVisualState
}

export interface UseConfiguratorExerciseReturn<TVisualState = Record<string, unknown>> {
  allQuestions: FlatQuestion[]
  currentQuestion: FlatQuestion | null
  currentQuestionIndex: number
  answers: Record<string, unknown>
  visualState: TVisualState
  progress: number
  currentStageIndex: number
  stageNames: string[]
  isComplete: boolean
  isLastQuestion: boolean
  canGoBack: boolean
  /** Direction of last navigation: 1 = forward, -1 = backward */
  direction: number
  handleAnswer: (key: string, value: unknown) => void
  handleComplete: () => void
  goBack: () => void
}

// =============================================================================
// HOOK
// =============================================================================

const defaultVisualMapping = (answers: Record<string, unknown>) => answers

export function useConfiguratorExercise<TVisualState = Record<string, unknown>>({
  exerciseSlug,
  stages,
  onComplete,
  savedAnswers,
  visualMapping,
}: UseConfiguratorExerciseOptions<TVisualState>): UseConfiguratorExerciseReturn<TVisualState> {
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    savedAnswers ?? {}
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [direction, setDirection] = useState(1)

  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout>>()

  // Flatten stages into ordered question list
  const allQuestions = useMemo<FlatQuestion[]>(() => {
    const flat: FlatQuestion[] = []
    let globalIdx = 0
    for (let s = 0; s < stages.length; s++) {
      const stage = stages[s]
      for (let q = 0; q < stage.questions.length; q++) {
        const question = stage.questions[q]
        flat.push({
          key: question.key,
          prompt: question.dynamicPrompt
            ? question.dynamicPrompt(answers)
            : question.prompt,
          type: question.type,
          options: question.options,
          min: question.min,
          max: question.max,
          skipLabel: question.skipLabel,
          stageName: stage.name,
          stageIndex: s,
          questionIndex: q,
          globalIndex: globalIdx,
        })
        globalIdx++
      }
    }
    return flat
  }, [stages, answers])

  const stageNames = useMemo(() => stages.map((s) => s.name), [stages])

  const currentQuestion = allQuestions[currentQuestionIndex] ?? null
  const currentStageIndex = currentQuestion?.stageIndex ?? 0
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1
  const canGoBack = currentQuestionIndex > 0

  // Initialize to first unanswered question if resuming
  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      const firstUnanswered = allQuestions.findIndex(
        (q) => savedAnswers[q.key] === undefined
      )
      if (firstUnanswered > 0) {
        setCurrentQuestionIndex(firstUnanswered)
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Compute progress (0-1)
  const progress = useMemo(() => {
    if (allQuestions.length === 0) return 0
    const answered = allQuestions.filter(
      (q) => answers[q.key] !== undefined
    ).length
    return answered / allQuestions.length
  }, [allQuestions, answers])

  // Compute visual state
  const mapper =
    visualMapping ??
    (defaultVisualMapping as unknown as (
      answers: Record<string, unknown>
    ) => TVisualState)
  const visualState = useMemo(() => mapper(answers), [answers, mapper])

  // Auto-save (debounced 2s)
  const autoSave = useCallback(
    (updatedAnswers: Record<string, unknown>) => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current)
      autoSaveTimeout.current = setTimeout(async () => {
        try {
          await fetch(`/api/exercises/${exerciseSlug}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              responses: updatedAnswers,
              status: "in_progress",
            }),
          })
        } catch {
          // Silent fail — auto-save is best-effort
        }
      }, 2000)
    },
    [exerciseSlug]
  )

  // Handle answering a question — records answer and auto-advances
  const handleAnswer = useCallback(
    (key: string, value: unknown) => {
      setAnswers((prev) => {
        const updated = { ...prev, [key]: value }
        autoSave(updated)
        return updated
      })

      // Auto-advance to next question after a short delay
      setTimeout(() => {
        setDirection(1)
        if (currentQuestionIndex < allQuestions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1)
        }
      }, 350)
    },
    [autoSave, currentQuestionIndex, allQuestions.length]
  )

  // Go back to previous question
  const goBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setDirection(-1)
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])

  // Handle completion
  const handleComplete = useCallback(() => {
    setIsComplete(true)
    onComplete(answers)
  }, [answers, onComplete])

  // Clean up auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current)
    }
  }, [])

  return {
    allQuestions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    visualState,
    progress,
    currentStageIndex,
    stageNames,
    isComplete,
    isLastQuestion,
    canGoBack,
    direction,
    handleAnswer,
    handleComplete,
    goBack,
  }
}
