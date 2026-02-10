"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import type {
  ExerciseMessage,
  ActiveQuestion,
} from "@/components/exercise-chat/ExerciseChat"
import type { ChipOption } from "@/components/exercise-chat/QuickReplyChips"

// =============================================================================
// TYPES
// =============================================================================

export interface ExerciseQuestionDef {
  key: string
  prompt: string
  type: "chips" | "multi_chips" | "number_scale" | "text" | "text_with_skip"
  options?: ChipOption[]
  min?: number
  max?: number
  skipLabel?: string
  /** AI generates the prompt dynamically based on previous answers */
  dynamicPrompt?: (answers: Record<string, unknown>) => string
}

export interface ExerciseStageDef {
  name: string
  questions: ExerciseQuestionDef[]
  /** AI transition message after stage completes */
  transitionPrompt?: (answers: Record<string, unknown>) => string
}

export interface UseConversationalExerciseOptions {
  exerciseSlug: string
  stages: ExerciseStageDef[]
  /** Initial AI greeting message */
  greeting: string
  /** Prompt sent to AI to generate a contextual intro after the greeting */
  introPrompt?: string
  /** Called when all stages are complete with final answers */
  onComplete: (answers: Record<string, unknown>) => void
  /** Resume from saved state */
  savedAnswers?: Record<string, unknown>
  savedStage?: number
  savedQuestion?: number
}

// =============================================================================
// HOOK
// =============================================================================

export function useConversationalExercise({
  exerciseSlug,
  stages,
  greeting,
  introPrompt,
  onComplete,
  savedAnswers,
  savedStage = 0,
  savedQuestion = 0,
}: UseConversationalExerciseOptions) {
  const [currentStageIndex, setCurrentStageIndex] = useState(savedStage)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedQuestion)
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    savedAnswers ?? {}
  )
  const [displayMessages, setDisplayMessages] = useState<ExerciseMessage[]>([])
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<
    string | string[] | number | null
  >(null)
  const [isExerciseComplete, setIsExerciseComplete] = useState(false)
  const [isWaitingForAI, setIsWaitingForAI] = useState(false)

  const messageIdRef = useRef(0)
  const hasGreeted = useRef(false)
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout>>()

  const nextMessageId = () => `msg-${++messageIdRef.current}`

  // AI chat for transitions and dynamic prompts
  const { append, isLoading: isAILoading } = useChat({
    api: "/api/chat/exercise",
    body: { exerciseSlug, answers },
    onFinish: (message) => {
      setDisplayMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: "assistant", content: message.content },
      ])
      setIsWaitingForAI(false)
      // After AI response, show the next question
      showCurrentQuestion()
    },
  })

  const addAssistantMessage = useCallback(
    (content: string) => {
      setDisplayMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: "assistant", content },
      ])
    },
    []
  )

  const addUserMessage = useCallback((content: string) => {
    setDisplayMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "user", content },
    ])
  }, [])

  // Show the current question's input
  const showCurrentQuestion = useCallback(() => {
    const stage = stages[currentStageIndex]
    if (!stage) return

    const question = stage.questions[currentQuestionIndex]
    if (!question) return

    // Show the question prompt as an assistant message
    const prompt = question.dynamicPrompt
      ? question.dynamicPrompt(answers)
      : question.prompt
    addAssistantMessage(prompt)

    // Set up the input type
    setActiveQuestion({
      type: question.type,
      options: question.options,
      min: question.min,
      max: question.max,
      skipLabel: question.skipLabel,
    })
    setSelectedAnswer(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageIndex, currentQuestionIndex, stages])

  // Initialize with greeting (and optional AI intro)
  useEffect(() => {
    if (!hasGreeted.current) {
      hasGreeted.current = true
      addAssistantMessage(greeting)

      // If resuming, fast-forward to the right question
      if (savedStage > 0 || savedQuestion > 0) {
        showCurrentQuestion()
      } else if (introPrompt) {
        // Send intro prompt to AI — onFinish will call showCurrentQuestion()
        setTimeout(() => {
          setIsWaitingForAI(true)
          append({ role: "user", content: `[INTRO] ${introPrompt}` })
        }, 600)
      } else {
        // No intro — short delay then show first question
        setTimeout(() => showCurrentQuestion(), 800)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const advance = useCallback(() => {
    const stage = stages[currentStageIndex]
    if (!stage) return

    const nextQ = currentQuestionIndex + 1

    if (nextQ < stage.questions.length) {
      // More questions in this stage
      setCurrentQuestionIndex(nextQ)
      setTimeout(() => showCurrentQuestion(), 300)
    } else {
      // Stage complete — check if there are more stages
      const nextStage = currentStageIndex + 1

      if (nextStage < stages.length) {
        // Use AI transition if defined, otherwise advance directly
        const transitionPrompt = stage.transitionPrompt?.(answers)
        if (transitionPrompt) {
          setIsWaitingForAI(true)
          setActiveQuestion(null)
          append({ role: "user", content: `[TRANSITION] ${transitionPrompt}` })
          setCurrentStageIndex(nextStage)
          setCurrentQuestionIndex(0)
        } else {
          setCurrentStageIndex(nextStage)
          setCurrentQuestionIndex(0)
          setTimeout(() => showCurrentQuestion(), 300)
        }
      } else {
        // All stages complete
        setActiveQuestion(null)
        setIsExerciseComplete(true)
        onComplete(answers)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageIndex, currentQuestionIndex, stages, answers, onComplete])

  // Handle answer selection
  const handleSelectChip = useCallback(
    (value: string) => {
      const stage = stages[currentStageIndex]
      const question = stage?.questions[currentQuestionIndex]
      if (!question) return

      if (question.type === "multi_chips") {
        setSelectedAnswer((prev) => {
          const arr = Array.isArray(prev) ? [...prev] : []
          const idx = arr.indexOf(value)
          if (idx >= 0) arr.splice(idx, 1)
          else arr.push(value)
          return arr
        })
        // For multi-select, don't auto-advance — need a confirm button
        // For now, we'll treat each chip tap as toggling, and use the last value
        return
      }

      // Single select — record and advance
      const label =
        question.options?.find((o) => o.value === value)?.label ?? value
      addUserMessage(label)
      setSelectedAnswer(value)
      setActiveQuestion(null)

      const updatedAnswers = { ...answers, [question.key]: value }
      setAnswers(updatedAnswers)
      autoSave(updatedAnswers)

      setTimeout(() => advance(), 200)
    },
    [stages, currentStageIndex, currentQuestionIndex, answers, addUserMessage, autoSave, advance]
  )

  const handleConfirmMultiSelect = useCallback(() => {
    const stage = stages[currentStageIndex]
    const question = stage?.questions[currentQuestionIndex]
    if (!question || !Array.isArray(selectedAnswer)) return

    const labels = selectedAnswer
      .map((v) => question.options?.find((o) => o.value === v)?.label ?? v)
      .join(", ")
    addUserMessage(labels)
    setActiveQuestion(null)

    const updatedAnswers = { ...answers, [question.key]: selectedAnswer }
    setAnswers(updatedAnswers)
    autoSave(updatedAnswers)

    setTimeout(() => advance(), 200)
  }, [stages, currentStageIndex, currentQuestionIndex, selectedAnswer, answers, addUserMessage, autoSave, advance])

  const handleSelectNumber = useCallback(
    (value: number) => {
      const stage = stages[currentStageIndex]
      const question = stage?.questions[currentQuestionIndex]
      if (!question) return

      addUserMessage(String(value))
      setSelectedAnswer(value)
      setActiveQuestion(null)

      const updatedAnswers = { ...answers, [question.key]: value }
      setAnswers(updatedAnswers)
      autoSave(updatedAnswers)

      setTimeout(() => advance(), 200)
    },
    [stages, currentStageIndex, currentQuestionIndex, answers, addUserMessage, autoSave, advance]
  )

  const handleSubmitText = useCallback(
    (text: string) => {
      const stage = stages[currentStageIndex]
      const question = stage?.questions[currentQuestionIndex]
      if (!question) return

      addUserMessage(text)
      setActiveQuestion(null)

      const updatedAnswers = { ...answers, [question.key]: text }
      setAnswers(updatedAnswers)
      autoSave(updatedAnswers)

      setTimeout(() => advance(), 200)
    },
    [stages, currentStageIndex, currentQuestionIndex, answers, addUserMessage, autoSave, advance]
  )

  const handleSkip = useCallback(() => {
    const stage = stages[currentStageIndex]
    const question = stage?.questions[currentQuestionIndex]
    if (!question) return

    addUserMessage("(skipped)")
    setActiveQuestion(null)

    setTimeout(() => advance(), 200)
  }, [stages, currentStageIndex, currentQuestionIndex, addUserMessage, advance])

  return {
    currentStageIndex,
    messages: displayMessages,
    activeQuestion,
    selectedAnswer,
    isStreaming: isAILoading || isWaitingForAI,
    isComplete: isExerciseComplete,
    answers,
    stageNames: stages.map((s) => s.name),
    handleSelectChip,
    handleConfirmMultiSelect,
    handleSelectNumber,
    handleSubmitText,
    handleSkip,
  }
}
