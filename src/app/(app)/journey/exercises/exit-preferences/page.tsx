"use client"

import { useState, useEffect, useCallback } from "react"
import { useExerciseFlow } from "@/hooks/useExerciseFlow"
import { ExercisePage } from "@/components/exercise-chat/ExercisePage"
import { RISK_EXIT_STAGES } from "@/lib/risk-exit/stages"
import { motion } from "framer-motion"
import { Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const DEFAULT_HOMI_PROMPTS = [
  "What are the biggest risks of co-ownership?",
  "How do agreements protect me?",
  "What if things don't work out?",
]

const PREFERENCE_LABELS: Record<string, Record<string, string>> = {
  risk_tolerance: {
    conservative: "Conservative",
    moderate: "Moderate",
    flexible: "Flexible",
  },
  dispute_resolution: {
    mediation: "Professional mediation",
    arbitration: "Binding arbitration",
    majority_vote: "Majority vote",
    per_agreement: "Per written agreement",
  },
  min_hold_period: {
    "5_plus": "5+ years",
    "3_5": "3-5 years",
    "1_3": "1-3 years",
    no_minimum: "No minimum",
  },
  buyout_method: {
    appraisal: "Independent appraisal",
    investment_plus: "Investment + appreciation",
    negotiated: "Negotiated",
    formula: "Pre-agreed formula",
  },
}

function PreferenceSummaryCard({ answers }: { answers: Record<string, unknown> }) {
  const summaryItems = [
    {
      label: "Risk Tolerance",
      value: PREFERENCE_LABELS.risk_tolerance?.[answers.risk_tolerance as string],
    },
    {
      label: "Dispute Resolution",
      value: PREFERENCE_LABELS.dispute_resolution?.[answers.dispute_resolution as string],
    },
    {
      label: "Minimum Hold Period",
      value: PREFERENCE_LABELS.min_hold_period?.[answers.min_hold_period as string],
    },
    {
      label: "Buyout Method",
      value: PREFERENCE_LABELS.buyout_method?.[answers.buyout_method as string],
    },
  ].filter((item) => item.value)

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">
          Your Risk & Exit Preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          These preferences will shape your co-ownership agreement
        </p>
      </motion.div>

      <div className="space-y-4 mb-8">
        {summaryItems.map((item, i) => (
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
        <Link href="/journey?completed=exit_preferences">
          <Button className="w-full gap-2">
            Continue Your Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

export default function ExitPreferencesPage() {
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
        const res = await fetch("/api/exercises/exit_preferences")
        if (res.ok) {
          const data = await res.json()
          if (data.response?.status === "in_progress" && data.response?.responses) {
            const responses = data.response.responses as Record<string, unknown>
            let stageIdx = 0
            let questionIdx = 0
            outer:
            for (let s = 0; s < RISK_EXIT_STAGES.length; s++) {
              for (let q = 0; q < RISK_EXIT_STAGES[s].questions.length; q++) {
                const key = RISK_EXIT_STAGES[s].questions[q].key
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
      try {
        await fetch("/api/exercises/exit_preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: answers,
            status: "completed",
          }),
        })
      } catch (error) {
        console.error("Failed to save exercise:", error)
      }
    },
    []
  )

  const exercise = useExerciseFlow({
    exerciseSlug: "exit_preferences",
    stages: RISK_EXIT_STAGES,
    onComplete: handleComplete,
    savedAnswers: savedState?.answers,
    savedStage: savedState?.stage,
    savedQuestion: savedState?.question,
  })

  // Get Homi prompts for current stage
  const currentStage = RISK_EXIT_STAGES[exercise.currentStageIndex]
  const homiPrompts = currentStage?.homiPrompts ?? DEFAULT_HOMI_PROMPTS

  // Compute flat question index
  const flatQuestionIndex = RISK_EXIT_STAGES
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
      title="Exit & Risk Preferences"
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
      currentPage="/journey/exercises/exit-preferences"
      onSelectAnswer={exercise.selectAnswer}
      onSubmitText={exercise.submitText}
      onSkip={exercise.skip}
      onPrevious={exercise.previousQuestion}
      intro={{
        pageId: "exit_preferences",
        title: "Exit & Risk Preferences",
        description: "This exercise helps you think through risk scenarios and exit strategies before they happen. Your preferences shape your co-ownership agreement.",
        bullets: [
          "8 questions across 2 sections",
          "About 5 minutes",
          "Shapes your co-ownership agreement",
        ],
        ctaText: "Let's Start",
      }}
    >
      <PreferenceSummaryCard answers={exercise.answers} />
    </ExercisePage>
  )
}
