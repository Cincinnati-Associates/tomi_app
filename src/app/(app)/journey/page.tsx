"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthContext } from "@/providers/AuthProvider"
import { JourneyShell } from "@/components/journey/JourneyShell"
import { WelcomeBanner } from "@/components/journey/WelcomeBanner"
import { CompletionCelebration } from "@/components/journey/CompletionCelebration"
import {
  JOURNEY_PHASES,
  getUnlockedPhases,
  getRecommendedExercise,
} from "@/lib/journey/phases"
import { useAssessmentLinker } from "@/hooks/useAssessmentLinker"
import type {
  JourneyState,
  PhaseProgress,
  ExerciseProgress,
  PartyData,
} from "@/lib/journey/types"

/**
 * Build journey state from API data.
 */
function buildJourneyState(
  exercises: Array<{
    slug: string
    userStatus: string
    userVersion: number
    completedAt: string | null
    responses?: Record<string, unknown>
    computedScores?: Record<string, unknown>
  }>,
  journey: { stage: string; readiness_score: number } | null,
  welcomeCompleted: boolean
): JourneyState {
  const completedSlugs = new Set<string>()
  const inProgressSlugs = new Set<string>()
  const exerciseMap = new Map<string, ExerciseProgress>()

  for (const ex of exercises) {
    exerciseMap.set(ex.slug, {
      slug: ex.slug,
      status: ex.userStatus as ExerciseProgress["status"],
      version: ex.userVersion,
      completedAt: ex.completedAt,
      responses: ex.responses,
      computedScores: ex.computedScores,
    })
    if (ex.userStatus === "completed") completedSlugs.add(ex.slug)
    if (ex.userStatus === "in_progress") inProgressSlugs.add(ex.slug)
  }

  const unlockedPhases = getUnlockedPhases(completedSlugs)

  const phases: PhaseProgress[] = JOURNEY_PHASES.map((phase) => {
    const exerciseProgress: ExerciseProgress[] = phase.exercises.map((ex) => {
      return (
        exerciseMap.get(ex.slug) ?? {
          slug: ex.slug,
          status: "not_started",
          version: 0,
          completedAt: null,
        }
      )
    })

    return {
      phaseId: phase.id,
      unlocked: unlockedPhases.has(phase.id),
      exerciseProgress,
      completedCount: exerciseProgress.filter((ep) => ep.status === "completed")
        .length,
      totalCount: phase.exercises.length,
    }
  })

  const totalExercises = JOURNEY_PHASES.flatMap((p) => p.exercises).length
  const completionPercentage =
    totalExercises > 0
      ? Math.round((completedSlugs.size / totalExercises) * 100)
      : 0

  let currentPhaseId = 0
  for (const phase of phases) {
    if (phase.unlocked && phase.completedCount < phase.totalCount) {
      currentPhaseId = phase.phaseId
      break
    }
  }

  const recommended = getRecommendedExercise(completedSlugs, inProgressSlugs)

  return {
    stage: journey?.stage ?? "exploring",
    readinessScore: journey?.readiness_score ?? 0,
    phases,
    tiles: [],
    completionPercentage,
    welcomeCompleted,
    entryPath: "cold",
    recommendedExercise: recommended,
    currentPhaseId,
  }
}

export default function JourneyPage() {
  const { profile, isLoading: authLoading, isAuthenticated } = useAuthContext()
  const searchParams = useSearchParams()
  const router = useRouter()
  const completedSlug = searchParams.get("completed")

  // Auto-link pending assessment data from sessionStorage after signup
  useAssessmentLinker(isAuthenticated)
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null)
  const [partyData, setPartyData] = useState<PartyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const fetchJourneyData = useCallback(async () => {
    try {
      const [exercisesRes, journeyRes, partyRes] = await Promise.all([
        fetch("/api/exercises", { cache: "no-store" }),
        fetch("/api/journey", { cache: "no-store" }),
        fetch("/api/parties/mine", { cache: "no-store" }),
      ])

      const exercisesData = exercisesRes.ok
        ? await exercisesRes.json()
        : { exercises: [] }
      const journeyData = journeyRes.ok ? await journeyRes.json() : null
      const partyResult: PartyData | null = partyRes.ok ? await partyRes.json() : null
      setPartyData(partyResult)

      const journeyRecord = journeyData?.id ? journeyData : null
      const welcomeCompleted = Boolean(
        journeyRecord?.targetMarkets &&
          typeof journeyRecord.targetMarkets === "object" &&
          (journeyRecord.targetMarkets as Record<string, unknown>)?._welcome_completed
      )

      const state = buildJourneyState(
        exercisesData.exercises ?? [],
        journeyRecord
          ? {
              stage: journeyRecord.stage,
              readiness_score: journeyRecord.readinessScore ?? 0,
            }
          : null,
        welcomeCompleted
      )

      setJourneyState(state)

      // Show welcome banner if first visit and no exercises started
      if (!welcomeCompleted && state.completionPercentage === 0) {
        setShowWelcomeBanner(true)
      }
    } catch (error) {
      console.error("Failed to load journey data:", error)
      setJourneyState(buildJourneyState([], null, false))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      fetchJourneyData()
    }
  }, [authLoading, fetchJourneyData])

  // Show celebration overlay when returning from a completed exercise
  useEffect(() => {
    if (completedSlug && journeyState) {
      setShowCelebration(true)
    }
  }, [completedSlug, journeyState])

  const handleDismissCelebration = useCallback(() => {
    setShowCelebration(false)
    router.replace("/journey")
  }, [router])

  const handleDismissWelcome = useCallback(async () => {
    setShowWelcomeBanner(false)
    try {
      await fetch("/api/journey", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetMarkets: [{ _welcome_completed: true }],
        }),
      })
    } catch {
      // Non-critical
    }
  }, [])

  if (authLoading || isLoading) {
    return (
      <div className="h-[calc(100dvh-56px)] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading your journey...
        </div>
      </div>
    )
  }

  if (!journeyState) return null

  const displayName = profile?.full_name?.split(" ")[0] ?? null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100dvh-56px)]"
    >
      <JourneyShell
        state={journeyState}
        userName={displayName}
        partyData={partyData}
        topSlot={
          showWelcomeBanner ? (
            <WelcomeBanner
              displayName={displayName}
              onDismiss={handleDismissWelcome}
            />
          ) : undefined
        }
      />

      <AnimatePresence>
        {showCelebration && completedSlug && (
          <CompletionCelebration
            exerciseSlug={completedSlug}
            journeyState={journeyState}
            onDismiss={handleDismissCelebration}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
