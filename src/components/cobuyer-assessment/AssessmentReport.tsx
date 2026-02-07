"use client"

import { motion } from "framer-motion"
import { Trophy, Target, Lightbulb, AlertTriangle, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AssessmentScoreResult, AssessmentGrade } from "@/lib/cobuyer-assessment/types"

const gradeConfig: Record<
  AssessmentGrade,
  {
    label: string
    tagline: string
    bgClass: string
    textClass: string
    borderClass: string
    icon: React.ElementType
  }
> = {
  A: {
    label: "Strong Match",
    tagline: "This looks like a great potential co-owner",
    bgClass: "bg-green-500/10",
    textClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-500/30",
    icon: Trophy,
  },
  B: {
    label: "Good Foundation",
    tagline: "Strong in key areas, some conversations needed",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/30",
    icon: Target,
  },
  C: {
    label: "Needs Discussion",
    tagline: "Potential is there but several topics need alignment",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500/30",
    icon: Lightbulb,
  },
  D: {
    label: "Significant Concerns",
    tagline: "Proceed with caution and open conversation",
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-500/30",
    icon: AlertTriangle,
  },
  F: {
    label: "Not Recommended",
    tagline: "Consider other candidates or deeper conversation first",
    bgClass: "bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-500/30",
    icon: XCircle,
  },
}

function DimensionBar({ name, percentage }: { name: string; percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-foreground font-medium">{name}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={cn(
            "h-full rounded-full",
            percentage >= 75
              ? "bg-green-500"
              : percentage >= 50
                ? "bg-amber-500"
                : "bg-red-500"
          )}
        />
      </div>
    </div>
  )
}

interface AssessmentReportProps {
  result: AssessmentScoreResult
  candidateName: string
  onAssessAnother: () => void
}

export function CobuyerAssessmentReport({
  result,
  candidateName,
  onAssessAnother,
}: AssessmentReportProps) {
  const config = gradeConfig[result.grade]
  const GradeIcon = config.icon

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8">
      {/* Grade badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className={cn(
            "inline-flex h-24 w-24 items-center justify-center rounded-full border-4 mb-4",
            config.bgClass,
            config.borderClass
          )}
        >
          <span className={cn("text-4xl font-bold", config.textClass)}>
            {result.grade}
          </span>
        </motion.div>

        <h2 className="text-xl font-heading font-bold text-foreground mb-1">
          {config.label}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          {result.totalPercentage}% compatibility with {candidateName}
        </p>
        <p className="text-sm text-muted-foreground">{config.tagline}</p>
      </motion.div>

      {/* Dimension scores */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border p-4 mb-6 space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Score Breakdown
        </h3>
        {result.dimensions.map((dim) => (
          <DimensionBar key={dim.name} name={dim.name} percentage={dim.percentage} />
        ))}
      </motion.div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 mb-4"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <GradeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            Top Strengths
          </h3>
          <ul className="space-y-1">
            {result.strengths.map((s) => (
              <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">+</span> {s}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Concerns */}
      {result.concerns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-4"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Areas of Concern
          </h3>
          <ul className="space-y-1">
            {result.concerns.map((c) => (
              <li key={c} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400">!</span> {c}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Conversations to Have */}
      {result.conversationsToHave.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border p-4 mb-8"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Conversations to Have with {candidateName}
          </h3>
          <ul className="space-y-2">
            {result.conversationsToHave.map((c, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {i + 1}. {c}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3"
      >
        <button
          onClick={onAssessAnother}
          className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Assess Another Candidate
        </button>

        <Link href="/journey" className="w-full">
          <Button className="w-full gap-2">
            Back to Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
