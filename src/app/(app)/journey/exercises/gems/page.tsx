"use client"

import { useState, useEffect, useCallback } from "react"
import { useExerciseFlow } from "@/hooks/useExerciseFlow"
import { ExercisePage } from "@/components/exercise-chat/ExercisePage"
import { GEMS_STAGES } from "@/lib/gems-exercise/stages"
import { motion } from "framer-motion"
import { Gem, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GEMS_LABELS } from "@/lib/gems-exercise/labels"
import { getStoredAssessment } from "@/lib/assessment-context"

const DEFAULT_HOMI_PROMPTS = [
  "What are the benefits of co-ownership?",
  "Is co-buying right for me?",
  "How does co-ownership work?",
]

/**
 * Load prior assessment answers for carry-forward.
 * Checks DB (authenticated) first, then sessionStorage (anonymous).
 */
async function loadPriorContext(): Promise<Record<string, unknown>> {
  // Try DB first (authenticated users)
  try {
    const res = await fetch("/api/exercises/cobuyer_candidate_assessment")
    if (res.ok) {
      const data = await res.json()
      if (data.response?.responses) {
        // The DB stores answers keyed by question key, but for carry-forward
        // we need the raw assessment answers array. Check if the assessment
        // data is stored in sessionStorage instead.
      }
    }
  } catch {
    // Continue to sessionStorage fallback
  }

  // SessionStorage fallback (anonymous users or if DB didn't have what we need)
  const stored = getStoredAssessment()
  if (stored?.answers) {
    return { assessmentAnswers: stored.answers }
  }

  return {}
}

function GemsSummaryCard({ answers }: { answers: Record<string, unknown> }) {
  const { goalLabels, commitmentLabels, involvementLabels } = GEMS_LABELS

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Gem className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">
          Your GEMs
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a summary of your Goals, Expectations & Motivations
        </p>
      </motion.div>

      <div className="space-y-4 mb-8">
        {[
          {
            label: "Primary Goal",
            value: goalLabels[answers.primary_goal as string] ?? (answers.primary_goal as string),
          },
          {
            label: "Commitment",
            value: commitmentLabels[answers.commitment_duration as string] ?? (answers.commitment_duration as string),
          },
          {
            label: "Involvement",
            value: involvementLabels[answers.involvement_level as string] ?? (answers.involvement_level as string),
          },
        ]
          .filter((item) => item.value)
          .map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-foreground">
                {item.value}
              </span>
            </motion.div>
          ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3"
      >
        <Link href="/journey?completed=gems_discovery">
          <Button className="w-full gap-2">
            Continue Your Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

export default function GemsExercisePage() {
  const [savedState, setSavedState] = useState<{
    answers: Record<string, unknown>
    stage: number
    question: number
  } | null>(null)
  const [isLoadingSaved, setIsLoadingSaved] = useState(true)
  const [priorContext, setPriorContext] = useState<Record<string, unknown>>({})

  // Load saved state + prior context in parallel
  useEffect(() => {
    async function load() {
      try {
        const [, prior] = await Promise.all([
          // Load saved exercise state
          (async () => {
            try {
              const res = await fetch("/api/exercises/gems_discovery")
              if (res.ok) {
                const data = await res.json()
                if (data.response?.status === "in_progress" && data.response?.responses) {
                  const responses = data.response.responses as Record<string, unknown>
                  let stageIdx = 0
                  let questionIdx = 0
                  let found = false
                  for (let s = 0; s < GEMS_STAGES.length; s++) {
                    for (let q = 0; q < GEMS_STAGES[s].questions.length; q++) {
                      const key = GEMS_STAGES[s].questions[q].key
                      if (responses[key] === undefined) {
                        stageIdx = s
                        questionIdx = q
                        found = true
                        break
                      }
                    }
                    if (found) break
                  }
                  setSavedState({
                    answers: responses,
                    stage: stageIdx,
                    question: questionIdx,
                  })
                }
              }
            } catch {
              // No saved state
            }
          })(),
          // Load prior assessment context
          loadPriorContext(),
        ])
        setPriorContext(prior)
      } finally {
        setIsLoadingSaved(false)
      }
    }
    load()
  }, [])

  const handleComplete = useCallback(
    async (answers: Record<string, unknown>) => {
      try {
        await fetch("/api/exercises/gems_discovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: answers,
            status: "completed",
          }),
        })
      } catch (error) {
        console.error("Failed to save GEMs:", error)
      }
    },
    []
  )

  const exercise = useExerciseFlow({
    exerciseSlug: "gems_discovery",
    stages: GEMS_STAGES,
    onComplete: handleComplete,
    savedAnswers: savedState?.answers,
    savedStage: savedState?.stage,
    savedQuestion: savedState?.question,
    priorContext,
  })

  // Get Homi prompts for current stage
  const currentStage = GEMS_STAGES[exercise.currentStageIndex]
  const homiPrompts = currentStage?.homiPrompts ?? DEFAULT_HOMI_PROMPTS

  // Compute flat question index for keying
  const flatQuestionIndex = GEMS_STAGES
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
      title="My GEMs"
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
      currentPage="/journey/exercises/gems"
      onSelectAnswer={exercise.selectAnswer}
      onSubmitText={exercise.submitText}
      onSkip={exercise.skip}
      onPrevious={exercise.previousQuestion}
      carryForwardData={exercise.carryForwardData}
      intro={{
        pageId: "gems_discovery",
        title: "My GEMs",
        description: "This is a short discovery exercise that helps you get clear on your Goals, Expectations, and Motivations for co-ownership. There are no wrong answers — everything you share helps personalize your journey.",
        bullets: [
          "6 questions across 2 sections",
          "About 5 minutes",
          "You can go back and change answers anytime",
        ],
        ctaText: "Let's Do This",
      }}
    >
      <GemsSummaryCard answers={exercise.answers} />
    </ExercisePage>
  )
}
