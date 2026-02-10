"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Lock, ArrowRight, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GEMS_LABELS } from "@/lib/gems-exercise/labels"
import {
  JOURNEY_PHASES,
  getExerciseBySlug,
  getPhase,
} from "@/lib/journey/phases"
import type { JourneyState } from "@/lib/journey/types"

interface CompletionCelebrationProps {
  exerciseSlug: string
  journeyState: JourneyState
  onDismiss: () => void
}

/**
 * Build a summary of the user's answers for a completed exercise.
 * Returns label/value pairs for display.
 */
function buildExerciseSummary(
  slug: string,
  responses: Record<string, unknown> | undefined
): { label: string; value: string }[] {
  if (!responses) return []

  if (slug === "gems_discovery") {
    const { goalLabels, timelineLabels, urgencyLabels } = GEMS_LABELS
    return [
      {
        label: "Primary Goal",
        value:
          goalLabels[responses.primary_goal as string] ??
          (responses.primary_goal as string) ??
          "",
      },
      {
        label: "Timeline",
        value:
          timelineLabels[responses.timeline as string] ??
          (responses.timeline as string) ??
          "",
      },
      {
        label: "Urgency",
        value:
          urgencyLabels[responses.urgency as string] ??
          (responses.urgency as string) ??
          "",
      },
    ].filter((item) => item.value)
  }

  // Generic fallback for other exercises
  return []
}

/**
 * Find which phases were newly unlocked by completing this exercise.
 * Compares current unlocked phases against what would be unlocked without this exercise.
 */
function getNewlyUnlockedPhases(
  exerciseSlug: string,
  journeyState: JourneyState
): number[] {
  // Find phases that are unlocked now
  const unlockedNow = new Set(
    journeyState.phases.filter((p) => p.unlocked).map((p) => p.phaseId)
  )

  // Find the phase this exercise belongs to
  const exercisePhase = JOURNEY_PHASES.find((p) =>
    p.exercises.some((e) => e.slug === exerciseSlug)
  )
  if (!exercisePhase) return []

  // Phases that depend on the exercise's phase and are now unlocked
  const newlyUnlocked: number[] = []
  for (const phase of JOURNEY_PHASES) {
    if (
      phase.unlockAfterPhases.includes(exercisePhase.id) &&
      unlockedNow.has(phase.id) &&
      phase.id !== exercisePhase.id
    ) {
      newlyUnlocked.push(phase.id)
    }
  }

  return newlyUnlocked
}

export function CompletionCelebration({
  exerciseSlug,
  journeyState,
  onDismiss,
}: CompletionCelebrationProps) {
  const [phase, setPhase] = useState<"checkmark" | "content">("checkmark")

  const exercise = getExerciseBySlug(exerciseSlug)
  const exerciseProgress = journeyState.phases
    .flatMap((p) => p.exerciseProgress)
    .find((ep) => ep.slug === exerciseSlug)

  const summary = buildExerciseSummary(exerciseSlug, exerciseProgress?.responses)
  const newlyUnlocked = getNewlyUnlockedPhases(exerciseSlug, journeyState)
  const recommended = journeyState.recommendedExercise
  const recommendedExercise = recommended
    ? getExerciseBySlug(recommended)
    : null

  // Transition from checkmark to content after animation
  useEffect(() => {
    const timer = setTimeout(() => setPhase("content"), 1400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        className="relative mx-4 w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl"
        style={{ maxHeight: "90dvh" }}
      >
        <AnimatePresence mode="wait">
          {phase === "checkmark" ? (
            <motion.div
              key="checkmark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center py-12"
            >
              {/* Animated checkmark circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="relative"
              >
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                </div>
                {/* Subtle ring pulse */}
                <motion.div
                  className="absolute inset-[-8px] rounded-full border-2 border-primary/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: [0, 0.5, 0] }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-4 text-lg font-heading font-bold text-foreground"
              >
                Complete!
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-heading font-bold text-foreground">
                  {exercise?.name ?? "Exercise"} Complete!
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Here&apos;s what you discovered
                </p>
              </div>

              {/* Summary Card */}
              {summary.length > 0 && (
                <div className="space-y-2">
                  {summary.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Newly Unlocked */}
              {newlyUnlocked.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      You unlocked {newlyUnlocked.length} new{" "}
                      {newlyUnlocked.length === 1 ? "step" : "steps"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {newlyUnlocked.map((phaseId) => {
                      const p = getPhase(phaseId)
                      if (!p) return null
                      return (
                        <div
                          key={phaseId}
                          className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                        >
                          <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {p.subtitle}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Recommended Next */}
              {recommendedExercise && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Recommended next
                  </p>
                  <Link
                    href={`/journey/exercises/${recommendedExercise.route}`}
                    className="block"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {recommendedExercise.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recommendedExercise.estimatedMinutes} min
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-2 pt-2"
              >
                {recommendedExercise && (
                  <Link href={`/journey/exercises/${recommendedExercise.route}`}>
                    <Button className="w-full gap-2">
                      Start Next Exercise
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={onDismiss}
                >
                  Explore Journey Map
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
