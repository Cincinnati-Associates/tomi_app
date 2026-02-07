"use client"

import { useState, useEffect, useCallback } from "react"
import { ExerciseChat } from "@/components/exercise-chat/ExerciseChat"
import { useConversationalExercise } from "@/hooks/useConversationalExercise"
import { GEMS_STAGES, GEMS_GREETING } from "@/lib/gems-exercise/stages"
import { motion } from "framer-motion"
import { Gem, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function GemsSummaryCard({ answers }: { answers: Record<string, unknown> }) {
  const goalLabels: Record<string, string> = {
    build_wealth: "Build wealth",
    afford_better: "Afford a better home",
    stop_renting: "Stop renting",
    near_people: "Live near family/friends",
    investment: "Investment property",
    other: "Custom goal",
  }
  const timelineLabels: Record<string, string> = {
    asap: "ASAP (3-6 months)",
    this_year: "This year",
    "1_2_years": "1-2 years",
    exploring: "Exploring for now",
  }
  const urgencyLabels: Record<string, string> = {
    very: "Very urgent",
    moderate: "Moderate",
    low: "Just exploring",
  }

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
            label: "Timeline",
            value: timelineLabels[answers.timeline as string] ?? (answers.timeline as string),
          },
          {
            label: "Urgency",
            value: urgencyLabels[answers.urgency as string] ?? (answers.urgency as string),
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
        <Link href="/journey">
          <Button className="w-full gap-2">
            Back to Journey
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

  // Load saved state
  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/exercises/gems_discovery")
        if (res.ok) {
          const data = await res.json()
          if (data.response?.status === "in_progress" && data.response?.responses) {
            const responses = data.response.responses as Record<string, unknown>
            // Figure out where they left off
            let stageIdx = 0
            let questionIdx = 0
            for (let s = 0; s < GEMS_STAGES.length; s++) {
              for (let q = 0; q < GEMS_STAGES[s].questions.length; q++) {
                const key = GEMS_STAGES[s].questions[q].key
                if (responses[key] === undefined) {
                  stageIdx = s
                  questionIdx = q
                  break
                }
              }
              if (stageIdx === s && questionIdx > 0) break
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
      } finally {
        setIsLoadingSaved(false)
      }
    }
    loadSaved()
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

  const exercise = useConversationalExercise({
    exerciseSlug: "gems_discovery",
    stages: GEMS_STAGES,
    greeting: GEMS_GREETING,
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
      title="GEMs Discovery"
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
      <GemsSummaryCard answers={exercise.answers} />
    </ExerciseChat>
  )
}
