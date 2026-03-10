"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { PiggyBank, ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ConfiguratorShell } from "@/components/configurator/ConfiguratorShell"
import { MoneyPictureScene } from "@/components/configurator/visuals/MoneyPictureScene"
import { MONEY_PICTURE_STAGES, MONEY_PICTURE_SUBTEXT } from "@/lib/money-picture/stages"
import {
  mapAnswersToVisual,
  formatCurrency,
  type MoneyPictureVisualState,
} from "@/lib/money-picture/visual-mappings"

// =============================================================================
// COMPLETION CARD
// =============================================================================

function FinancialSnapshotCard({
  visualState,
}: {
  answers: Record<string, unknown>
  visualState: MoneyPictureVisualState
}) {
  const {
    soloMax,
    groupMax,
    unlockAmount,
    monthlyPayment,
    creditTier,
    marketMedian,
    marketCity,
    coBuyerCount,
    timeline,
    affordabilityStatus,
  } = visualState

  const statusLabels = {
    within_reach: "Your group buying power covers the median home price here.",
    stretch: "You're close — a slightly lower price point or more savings could close the gap.",
    gap: "There's a gap between your group buying power and the market median. That's okay — this is a starting point.",
    unknown: "",
  }

  const creditLabels: Record<string, string> = {
    excellent: "Excellent (740+)",
    good: "Good (670–739)",
    fair: "Fair (580–669)",
    unsure: "Not sure yet",
  }

  const summaryItems = [
    { label: "Solo Buying Power", value: formatCurrency(soloMax), show: soloMax > 0 },
    {
      label: `Group Buying Power (${coBuyerCount} people)`,
      value: formatCurrency(groupMax),
      show: groupMax > 0,
      highlight: true,
    },
    {
      label: "Co-Buying Unlock",
      value: `+${formatCurrency(unlockAmount)}`,
      show: unlockAmount > 0,
      accent: true,
    },
    {
      label: "Est. Monthly Payment (solo)",
      value: `~${formatCurrency(monthlyPayment)}`,
      show: monthlyPayment > 0,
    },
    { label: "Credit Score", value: creditLabels[creditTier ?? ""] ?? "—", show: !!creditTier },
    {
      label: "Target Market",
      value: marketCity || "—",
      show: !!marketCity,
    },
    {
      label: "Market Median",
      value: formatCurrency(marketMedian),
      show: marketMedian > 0,
    },
    { label: "Timeline", value: timeline ?? "—", show: !!timeline },
  ].filter((item) => item.show)

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <PiggyBank className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">
          Your Money Picture
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what co-ownership could look like for you
        </p>
      </motion.div>

      {/* Visual snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden bg-muted/30 mb-6"
      >
        <MoneyPictureScene visualState={visualState} />
      </motion.div>

      {/* Market status message */}
      {affordabilityStatus !== "unknown" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-muted/20 p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Market Snapshot</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {statusLabels[affordabilityStatus]}
          </p>
        </motion.div>
      )}

      {/* Summary list */}
      <div className="space-y-3 mb-8">
        {summaryItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className={`flex items-center justify-between rounded-xl border p-4 ${
              item.accent
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                : item.highlight
                  ? "border-primary/20 bg-primary/5"
                  : "border-border"
            }`}
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span
              className={`text-sm font-medium ${
                item.accent
                  ? "text-green-700 dark:text-green-400"
                  : item.highlight
                    ? "text-primary"
                    : "text-foreground"
              }`}
            >
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3"
      >
        <Link href="/journey?completed=money_picture">
          <Button className="w-full gap-2">
            Continue Your Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

// =============================================================================
// PAGE
// =============================================================================

export default function MoneyPictureExercisePage() {
  const [savedAnswers, setSavedAnswers] = useState<
    Record<string, unknown> | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved state
  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/exercises/money_picture")
        if (res.ok) {
          const data = await res.json()
          if (
            data.response?.status === "in_progress" &&
            data.response?.responses
          ) {
            setSavedAnswers(data.response.responses as Record<string, unknown>)
          }
        }
      } catch {
        // No saved state
      } finally {
        setIsLoading(false)
      }
    }
    loadSaved()
  }, [])

  const handleComplete = useCallback(
    async (answers: Record<string, unknown>) => {
      try {
        await fetch("/api/exercises/money_picture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: answers,
            status: "completed",
          }),
        })
      } catch (error) {
        console.error("Failed to save Money Picture:", error)
      }
    },
    []
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ConfiguratorShell<MoneyPictureVisualState>
      title="The Money Picture"
      exerciseSlug="money_picture"
      stages={MONEY_PICTURE_STAGES}
      visualMapping={mapAnswersToVisual}
      VisualComponent={MoneyPictureScene}
      onComplete={handleComplete}
      savedAnswers={savedAnswers}
      questionSubtext={MONEY_PICTURE_SUBTEXT}
    >
      {({ answers, visualState }) => (
        <FinancialSnapshotCard answers={answers} visualState={visualState} />
      )}
    </ConfiguratorShell>
  )
}
