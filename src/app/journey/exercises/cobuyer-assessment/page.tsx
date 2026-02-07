"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ExerciseChat } from "@/components/exercise-chat/ExerciseChat"
import { useConversationalExercise } from "@/hooks/useConversationalExercise"
import { COBUYER_STAGES, COBUYER_GREETING } from "@/lib/cobuyer-assessment/stages"
import { scoreCobuyerAssessment } from "@/lib/cobuyer-assessment/scoring"
import { CobuyerAssessmentReport } from "@/components/cobuyer-assessment/AssessmentReport"
import type { AssessmentScoreResult } from "@/lib/cobuyer-assessment/types"

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
            // Find where they left off
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
      // Score the assessment
      const result = scoreCobuyerAssessment(answers)
      setScoreResult(result)

      // Save to API
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
    // Start a retake
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
    // Reload the page to start fresh
    router.refresh()
    window.location.reload()
  }, [router])

  const exercise = useConversationalExercise({
    exerciseSlug: "cobuyer_candidate_assessment",
    stages: COBUYER_STAGES,
    greeting: COBUYER_GREETING,
    onComplete: handleComplete,
    savedAnswers: savedState?.answers,
    savedStage: savedState?.stage,
    savedQuestion: savedState?.question,
  })

  if (isLoadingSaved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ExerciseChat
      title="Co-Buyer Assessment"
      stages={exercise.stageNames}
      currentStageIndex={exercise.currentStageIndex}
      messages={exercise.messages}
      activeQuestion={exercise.activeQuestion}
      selectedAnswer={exercise.selectedAnswer}
      isStreaming={exercise.isStreaming}
      isComplete={exercise.isComplete}
      onSelectChip={exercise.handleSelectChip}
      onSelectNumber={exercise.handleSelectNumber}
      onSubmitText={exercise.handleSubmitText}
      onSkip={exercise.handleSkip}
    >
      {scoreResult && (
        <CobuyerAssessmentReport
          result={scoreResult}
          candidateName={(exercise.answers.candidate_name as string) ?? "Candidate"}
          onAssessAnother={handleAssessAnother}
        />
      )}
    </ExerciseChat>
  )
}
