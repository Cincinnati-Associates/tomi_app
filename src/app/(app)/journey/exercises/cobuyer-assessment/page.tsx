"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useExerciseFlow } from "@/hooks/useExerciseFlow"
import { ExercisePage } from "@/components/exercise-chat/ExercisePage"
import { COBUYER_STAGES } from "@/lib/cobuyer-assessment/stages"
import { scoreCobuyerAssessment } from "@/lib/cobuyer-assessment/scoring"
import { CobuyerAssessmentReport } from "@/components/cobuyer-assessment/AssessmentReport"
import type { AssessmentScoreResult } from "@/lib/cobuyer-assessment/types"

const DEFAULT_HOMI_PROMPTS = [
  "What makes a good co-buyer?",
  "How important is financial compatibility?",
  "What should I look for in a partner?",
]

export default function CobuyerAssessmentPage() {
  const router = useRouter()
  const [scoreResult, setScoreResult] = useState<AssessmentScoreResult | null>(null)
  const [savedState, setSavedState] = useState<{
    answers: Record<string, unknown>
    stage: number
    question: number
  } | null>(null)
  const [isLoadingSaved, setIsLoadingSaved] = useState(true)

  // Load saved in-progress response
  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/exercises/cobuyer_candidate_assessment")
        if (res.ok) {
          const data = await res.json()
          if (data.response?.status === "in_progress" && data.response?.responses) {
            const responses = data.response.responses as Record<string, unknown>
            let stageIdx = 0
            let questionIdx = 0
            outer:
            for (let s = 0; s < COBUYER_STAGES.length; s++) {
              for (let q = 0; q < COBUYER_STAGES[s].questions.length; q++) {
                const key = COBUYER_STAGES[s].questions[q].key
                if (responses[key] === undefined) {
                  stageIdx = s
                  questionIdx = q
                  break outer
                }
              }
            }
            setSavedState({ answers: responses, stage: stageIdx, question: questionIdx })
          }
        }
      } catch {
        // No saved state
      } finally {
        setIsLoadingSaved(false)
      }
    }
    loadSaved()
  }, [])

  const handleComplete = useCallback(
    async (answers: Record<string, unknown>) => {
      const result = scoreCobuyerAssessment(answers)
      setScoreResult(result)

      try {
        await fetch("/api/exercises/cobuyer_candidate_assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: answers,
            status: "completed",
          }),
        })
      } catch (error) {
        console.error("Failed to save assessment:", error)
      }
    },
    []
  )

  const handleAssessAnother = useCallback(async () => {
    try {
      await fetch("/api/exercises/cobuyer_candidate_assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: {},
          status: "in_progress",
          retake: true,
        }),
      })
    } catch {
      // Non-critical
    }
    router.refresh()
    window.location.reload()
  }, [router])

  const exercise = useExerciseFlow({
    exerciseSlug: "cobuyer_candidate_assessment",
    stages: COBUYER_STAGES,
    onComplete: handleComplete,
    savedAnswers: savedState?.answers,
    savedStage: savedState?.stage,
    savedQuestion: savedState?.question,
  })

  // Get Homi prompts for current stage
  const currentStage = COBUYER_STAGES[exercise.currentStageIndex]
  const homiPrompts = currentStage?.homiPrompts ?? DEFAULT_HOMI_PROMPTS

  // Compute flat question index
  const flatQuestionIndex = COBUYER_STAGES
    .slice(0, exercise.currentStageIndex)
    .reduce((sum, s) => sum + s.questions.length, 0) + exercise.currentQuestionIndex

  if (isLoadingSaved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ExercisePage
      title="Co-Buyer Check-In"
      stages={exercise.stageNames}
      currentStageIndex={exercise.currentStageIndex}
      currentQuestion={exercise.currentQuestion}
      questionIndex={flatQuestionIndex}
      answers={exercise.answers}
      isComplete={exercise.isComplete}
      totalQuestions={exercise.totalQuestions}
      answeredCount={exercise.answeredCount}
      canGoBack={exercise.canGoBack}
      homiPrompts={homiPrompts}
      currentPage="/journey/exercises/cobuyer-assessment"
      onSelectAnswer={exercise.selectAnswer}
      onSubmitText={exercise.submitText}
      onSkip={exercise.skip}
      onPrevious={exercise.previousQuestion}
      multiSelectValues={exercise.multiSelectValues}
      onToggleMultiSelect={exercise.toggleMultiSelect}
      onConfirmMultiSelect={exercise.confirmMultiSelect}
      intro={{
        pageId: "cobuyer_assessment",
        title: "Co-Buyer Check-In",
        description: "This exercise helps you privately think through how well someone might work as a co-ownership partner. It covers relationship, finances, lifestyle, and more. Everything stays between you and Homi.",
        bullets: [
          "23 questions across 7 sections",
          "About 8 minutes",
          "Completely private — only you see the results",
        ],
        ctaText: "Let's Start",
      }}
    >
      {scoreResult && (
        <CobuyerAssessmentReport
          result={scoreResult}
          candidateName={(exercise.answers.candidate_name as string) ?? "Candidate"}
          onAssessAnother={handleAssessAnother}
        />
      )}
    </ExercisePage>
  )
}
