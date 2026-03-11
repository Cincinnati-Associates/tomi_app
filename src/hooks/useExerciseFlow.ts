"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ExerciseQuestionDef, ExerciseStageDef } from "@/hooks/useConversationalExercise"

// Re-export types so consumers can import from here
export type { ExerciseQuestionDef, ExerciseStageDef }

export interface UseExerciseFlowOptions {
  exerciseSlug: string
  stages: ExerciseStageDef[]
  /** Called when all stages are complete with final answers */
  onComplete: (answers: Record<string, unknown>) => void
  /** Resume from saved state */
  savedAnswers?: Record<string, unknown>
  savedStage?: number
  savedQuestion?: number
  /** Prior context for carry-forward questions (e.g. assessment answers) */
  priorContext?: Record<string, unknown>
}

export interface ExerciseFlowState {
  currentStageIndex: number
  currentQuestionIndex: number
  currentQuestion: ExerciseQuestionDef | null
  answers: Record<string, unknown>
  isComplete: boolean
  stageNames: string[]
  /** Select an answer for the current question (for chips/number_scale) */
  selectAnswer: (value: string | number) => void
  /** Toggle a multi-select chip (for multi_chips) */
  toggleMultiSelect: (value: string) => void
  /** Confirm multi-select and advance */
  confirmMultiSelect: () => void
  /** Submit text answer */
  submitText: (text: string) => void
  /** Skip current question */
  skip: () => void
  /** Go to previous question */
  previousQuestion: () => void
  /** Whether we can go back */
  canGoBack: boolean
  /** Total flat question index (for progress) */
  totalQuestions: number
  /** Number of answered questions */
  answeredCount: number
  /** Resolved carry-forward data for the current confirm question (if any) */
  carryForwardData: { label: string; value: string } | null
  /** Current multi-select selections (for multi_chips) */
  multiSelectValues: string[]
}

export function useExerciseFlow({
  exerciseSlug,
  stages,
  onComplete,
  savedAnswers,
  savedStage = 0,
  savedQuestion = 0,
  priorContext,
}: UseExerciseFlowOptions): ExerciseFlowState {
  const [currentStageIndex, setCurrentStageIndex] = useState(savedStage)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedQuestion)
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    savedAnswers ?? {}
  )
  const [isComplete, setIsComplete] = useState(false)
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([])

  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout>>()
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Current question accessor
  const stage = stages[currentStageIndex]
  const currentQuestion = stage?.questions[currentQuestionIndex] ?? null

  // Compute the actual prompt (handle dynamicPrompt + confirm carry-forward)
  const carryForwardData = (() => {
    if (!currentQuestion) return null
    if (currentQuestion.type !== "confirm" || !currentQuestion.carryForward || !priorContext) return null
    return currentQuestion.carryForward(priorContext)
  })()

  const resolvedQuestion: ExerciseQuestionDef | null = (() => {
    if (!currentQuestion) return null

    let resolved = {
      ...currentQuestion,
      prompt: currentQuestion.dynamicPrompt
        ? currentQuestion.dynamicPrompt(answers)
        : currentQuestion.prompt,
    }

    // For confirm-type questions with no prior data, fall back to regular type
    if (resolved.type === "confirm" && !carryForwardData) {
      resolved = {
        ...resolved,
        type: resolved.confirmFallbackType ?? "chips",
      }
    }

    return resolved
  })()

  const totalQuestions = stages.reduce((sum, s) => sum + s.questions.length, 0)
  const answeredCount = Object.keys(answers).length

  // Flat question index for back navigation
  const flatIndex = stages
    .slice(0, currentStageIndex)
    .reduce((sum, s) => sum + s.questions.length, 0) + currentQuestionIndex

  const canGoBack = flatIndex > 0

  // Auto-save answers (debounced)
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
          // Silently fail — auto-save is best-effort
        }
      }, 2000)
    },
    [exerciseSlug]
  )

  // Advance to the next question or stage
  const advance = useCallback(
    (updatedAnswers: Record<string, unknown>) => {
      const currentStage = stages[currentStageIndex]
      if (!currentStage) return

      const nextQ = currentQuestionIndex + 1

      if (nextQ < currentStage.questions.length) {
        // More questions in this stage
        setCurrentQuestionIndex(nextQ)
      } else {
        // Stage complete — check if there are more stages
        const nextStageIdx = currentStageIndex + 1

        if (nextStageIdx < stages.length) {
          // Just advance to the next stage (no interstitial)
          setCurrentStageIndex(nextStageIdx)
          setCurrentQuestionIndex(0)
        } else {
          // All stages complete
          setIsComplete(true)
          onCompleteRef.current(updatedAnswers)
        }
      }
    },
    [currentStageIndex, currentQuestionIndex, stages]
  )

  // Record answer and advance
  const recordAndAdvance = useCallback(
    (value: string | number) => {
      if (!currentQuestion) return
      const updatedAnswers = { ...answers, [currentQuestion.key]: value }
      setAnswers(updatedAnswers)
      autoSave(updatedAnswers)
      // Small delay for selection animation, then advance
      setTimeout(() => advance(updatedAnswers), 200)
    },
    [currentQuestion, answers, autoSave, advance]
  )

  const selectAnswer = useCallback(
    (value: string | number) => {
      recordAndAdvance(value)
    },
    [recordAndAdvance]
  )

  const toggleMultiSelect = useCallback(
    (value: string) => {
      setMultiSelectValues((prev) => {
        const idx = prev.indexOf(value)
        if (idx >= 0) return prev.filter((v) => v !== value)
        return [...prev, value]
      })
    },
    []
  )

  const confirmMultiSelect = useCallback(() => {
    if (!currentQuestion) return
    const values = multiSelectValues.length > 0 ? multiSelectValues : ["none"]
    const updatedAnswers = { ...answers, [currentQuestion.key]: values }
    setAnswers(updatedAnswers)
    autoSave(updatedAnswers)
    setMultiSelectValues([])
    setTimeout(() => advance(updatedAnswers), 200)
  }, [currentQuestion, multiSelectValues, answers, autoSave, advance])

  const submitText = useCallback(
    (text: string) => {
      recordAndAdvance(text)
    },
    [recordAndAdvance]
  )

  const skip = useCallback(() => {
    if (!currentQuestion) return
    const updatedAnswers = { ...answers, [currentQuestion.key]: "(skipped)" }
    setAnswers(updatedAnswers)
    autoSave(updatedAnswers)
    setTimeout(() => advance(updatedAnswers), 200)
  }, [currentQuestion, answers, autoSave, advance])

  const previousQuestion = useCallback(() => {
    if (!canGoBack) return

    setMultiSelectValues([])
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else {
      // Go back to previous stage's last question
      const prevStageIdx = currentStageIndex - 1
      if (prevStageIdx >= 0) {
        const prevStage = stages[prevStageIdx]
        setCurrentStageIndex(prevStageIdx)
        setCurrentQuestionIndex(prevStage.questions.length - 1)
      }
    }
  }, [canGoBack, currentQuestionIndex, currentStageIndex, stages])

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current)
    }
  }, [])

  return {
    currentStageIndex,
    currentQuestionIndex,
    currentQuestion: resolvedQuestion,
    answers,
    isComplete,
    stageNames: stages.map((s) => s.name),
    selectAnswer,
    toggleMultiSelect,
    confirmMultiSelect,
    submitText,
    skip,
    previousQuestion,
    canGoBack,
    totalQuestions,
    answeredCount,
    carryForwardData,
    multiSelectValues,
  }
}
