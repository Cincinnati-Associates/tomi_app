"use client"

import { useMemo } from "react"
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ConfiguratorQuestion } from "./ConfiguratorQuestion"
import { ConfiguratorVisual } from "./ConfiguratorVisual"
import { useIsMobile } from "@/hooks/useIsMobile"
import { cn } from "@/lib/utils"
import {
  useConfiguratorExercise,
  type UseConfiguratorExerciseOptions,
} from "@/hooks/useConfiguratorExercise"

// =============================================================================
// DOT PROGRESS
// =============================================================================

function DotProgress({
  total,
  current,
  answers,
  allQuestions,
}: {
  total: number
  current: number
  answers: Record<string, unknown>
  allQuestions: { key: string }[]
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = answers[allQuestions[i]?.key] !== undefined
        const isCurrent = i === current
        return (
          <motion.div
            key={i}
            className={cn(
              "rounded-full transition-all duration-300",
              isCurrent
                ? "w-6 h-2.5 bg-primary"
                : isAnswered
                  ? "w-2.5 h-2.5 bg-primary/40"
                  : "w-2.5 h-2.5 bg-muted-foreground/20"
            )}
            layout
          />
        )
      })}
    </div>
  )
}

// =============================================================================
// SLIDE VARIANTS
// =============================================================================

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

// =============================================================================
// SHELL
// =============================================================================

interface ConfiguratorShellProps<TVisualState = Record<string, unknown>> {
  title: string
  exerciseSlug: string
  stages: UseConfiguratorExerciseOptions["stages"]
  visualMapping: (answers: Record<string, unknown>) => TVisualState
  VisualComponent: React.ComponentType<{ visualState: TVisualState }>
  onComplete: (answers: Record<string, unknown>) => void
  savedAnswers?: Record<string, unknown>
  backHref?: string
  /** Optional educational subtext keyed by question key */
  questionSubtext?: Record<string, string>
  children?: (props: {
    answers: Record<string, unknown>
    visualState: TVisualState
  }) => React.ReactNode
}

export function ConfiguratorShell<TVisualState = Record<string, unknown>>({
  title,
  exerciseSlug,
  stages,
  visualMapping,
  VisualComponent,
  onComplete,
  savedAnswers,
  backHref = "/journey",
  questionSubtext,
  children,
}: ConfiguratorShellProps<TVisualState>) {
  const isMobile = useIsMobile()

  const exercise = useConfiguratorExercise<TVisualState>({
    exerciseSlug,
    stages,
    onComplete,
    savedAnswers,
    visualMapping,
  })

  // Determine if the first question in a new stage
  const showStageLabel = useMemo(() => {
    if (!exercise.currentQuestion) return false
    return exercise.currentQuestion.questionIndex === 0
  }, [exercise.currentQuestion])

  const allAnswered = exercise.progress === 1

  // ── Complete state ──────────────────────────────────────────────────
  if (exercise.isComplete && children) {
    return (
      <div className="min-h-screen pb-safe">
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
        </div>
        <div className="pt-4">
          {children({
            answers: exercise.answers,
            visualState: exercise.visualState,
          })}
        </div>
      </div>
    )
  }

  // ── Main layout ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 top-14 flex flex-col bg-background z-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          {exercise.canGoBack ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={exercise.goBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <h2 className="text-sm font-semibold text-foreground truncate">
            {title}
          </h2>
        </div>

        {/* Stage label */}
        {exercise.currentQuestion && (
          <span className="text-xs font-medium text-muted-foreground">
            {exercise.currentQuestion.stageName}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ── Visual panel ── */}
        <div
          className={cn(
            "flex-shrink-0",
            isMobile
              ? "h-[35vh] max-h-[280px]"
              : "w-1/2 flex items-center justify-center p-8"
          )}
        >
          <ConfiguratorVisual
            className={cn(
              isMobile
                ? "h-full w-full rounded-none"
                : "aspect-[4/3] w-full max-w-lg rounded-2xl"
            )}
          >
            <VisualComponent visualState={exercise.visualState} />
          </ConfiguratorVisual>
        </div>

        {/* ── Question panel ── */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            isMobile ? "px-4" : "w-1/2 px-8"
          )}
        >
          {/* Question area — fills available space, centered vertically */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait" custom={exercise.direction}>
                {exercise.currentQuestion && (
                  <motion.div
                    key={exercise.currentQuestionIndex}
                    custom={exercise.direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {/* Stage label */}
                    {showStageLabel && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 block">
                        {exercise.currentQuestion.stageName}
                      </span>
                    )}

                    <ConfiguratorQuestion
                      question={exercise.currentQuestion}
                      answer={exercise.answers[exercise.currentQuestion.key]}
                      onAnswer={exercise.handleAnswer}
                      subtext={questionSubtext?.[exercise.currentQuestion.key]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Build My Vision button — shown on last question once answered */}
              {exercise.isLastQuestion &&
                exercise.answers[exercise.currentQuestion?.key ?? ""] !==
                  undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={exercise.handleComplete}
                      disabled={!allAnswered}
                      className="w-full gap-2"
                      size="lg"
                    >
                      Build My Vision
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
            </div>
          </div>

          {/* Dot progress — pinned to bottom */}
          <div className="flex-shrink-0 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <DotProgress
              total={exercise.allQuestions.length}
              current={exercise.currentQuestionIndex}
              answers={exercise.answers}
              allQuestions={exercise.allQuestions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
