"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/shared/PageIntro"
import { ExerciseQuestion } from "./ExerciseQuestion"
import { ExerciseHomiInput } from "./ExerciseHomiInput"
import type { ExerciseQuestionDef } from "@/hooks/useExerciseFlow"

// ─── Stage progress dots ────────────────────────────────────────────────────

function StageProgressDots({
  stages,
  currentStageIndex,
}: {
  stages: string[]
  currentStageIndex: number
}) {
  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, i) => {
        const isComplete = i < currentStageIndex
        const isCurrent = i === currentStageIndex
        return (
          <div key={stage} className="flex flex-col items-center gap-0.5">
            <span
              className={cn(
                "text-[9px] font-medium transition-colors duration-300 leading-none hidden sm:block",
                isCurrent
                  ? "text-primary"
                  : isComplete
                  ? "text-foreground/70"
                  : "text-muted-foreground/50"
              )}
            >
              {stage}
            </span>
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isCurrent
                  ? "bg-primary w-6"
                  : isComplete
                  ? "bg-primary/60 w-4"
                  : "bg-muted w-2"
              )}
            />
          </div>
        )
      })}
      <span className="ml-1 text-xs text-muted-foreground sm:hidden">
        {currentStageIndex + 1}/{stages.length}
      </span>
    </div>
  )
}

// ─── Progress bar ───────────────────────────────────────────────────────────

function ProgressBar({
  answered,
  total,
}: {
  answered: number
  total: number
}) {
  const percent = total > 0 ? (answered / total) * 100 : 0

  return (
    <div className="relative h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  )
}

// ─── Main ExercisePage ──────────────────────────────────────────────────────

interface ExercisePageProps {
  title: string
  stages: string[]
  currentStageIndex: number
  currentQuestion: ExerciseQuestionDef | null
  /** Flat question index (for AnimatePresence keying) */
  questionIndex: number
  answers: Record<string, unknown>
  isComplete: boolean
  totalQuestions: number
  answeredCount: number
  canGoBack: boolean
  /** Homi prompts for the current stage */
  homiPrompts: string[]
  /** Page path for Homi context */
  currentPage: string
  onSelectAnswer: (value: string | number) => void
  onSubmitText: (text: string) => void
  onSkip: () => void
  onPrevious: () => void
  backHref?: string
  /** Completion content (summary card) */
  children?: React.ReactNode
  /** PageIntro config — shown once on first visit */
  intro?: {
    pageId: string
    title: string
    description: string
    bullets?: string[]
    ctaText?: string
  }
  /** Carry-forward data for confirm-type questions */
  carryForwardData?: { label: string; value: string } | null
  /** Multi-select support */
  multiSelectValues?: string[]
  onToggleMultiSelect?: (value: string) => void
  onConfirmMultiSelect?: () => void
}

export function ExercisePage({
  title,
  stages,
  currentStageIndex,
  currentQuestion,
  questionIndex,
  answers,
  isComplete,
  totalQuestions,
  answeredCount,
  canGoBack,
  homiPrompts,
  currentPage,
  onSelectAnswer,
  onSubmitText,
  onSkip,
  onPrevious,
  backHref = "/journey",
  children,
  intro,
  carryForwardData,
  multiSelectValues,
  onToggleMultiSelect,
  onConfirmMultiSelect,
}: ExercisePageProps) {
  // ── Complete state ──
  if (isComplete && children) {
    return (
      <div className="min-h-screen pb-safe">
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
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
        <div className="pt-4">{children}</div>
      </div>
    )
  }

  // ── Main exercise layout ──
  return (
    <>
      {/* PageIntro overlay — shows once on first visit */}
      {intro && (
        <PageIntro
          pageId={intro.pageId}
          title={intro.title}
          description={intro.description}
          bullets={intro.bullets}
          ctaText={intro.ctaText}
        />
      )}

      <div className="fixed inset-0 top-14 flex flex-col bg-background z-10">
        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <Link href={backHref}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h2 className="font-heading font-semibold text-sm sm:text-base text-foreground leading-tight truncate">
                {title}
              </h2>
            </div>
            <StageProgressDots stages={stages} currentStageIndex={currentStageIndex} />
          </div>

          {/* Progress bar */}
          <div className="px-4 pb-2">
            <ProgressBar answered={answeredCount} total={totalQuestions} />
          </div>
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col px-4 min-h-0">
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={`q-${questionIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Question + options — pinned toward top */}
                <div className="flex flex-col items-center pt-[4vh] md:pt-[6vh]">
                  {currentQuestion && (
                    <ExerciseQuestion
                      question={currentQuestion}
                      questionIndex={questionIndex}
                      selectedAnswer={answers[currentQuestion.key]}
                      onSelectAnswer={onSelectAnswer}
                      onSubmitText={onSubmitText}
                      onSkip={
                        currentQuestion.type === "text_with_skip"
                          ? onSkip
                          : undefined
                      }
                      onPrevious={onPrevious}
                      showPrevious={canGoBack}
                      carryForwardData={carryForwardData}
                      multiSelectValues={multiSelectValues}
                      onToggleMultiSelect={onToggleMultiSelect}
                      onConfirmMultiSelect={onConfirmMultiSelect}
                    />
                  )}
                </div>

                {/* Spacer — splits remaining space so Homi sits at midpoint */}
                <div className="flex-1" />

                {/* Bottom slot: Homi mini input */}
                <div className="flex-1 flex items-start justify-center">
                  <div className="w-full max-w-lg">
                    <ExerciseHomiInput
                      prompts={homiPrompts}
                      currentPage={currentPage}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  )
}
