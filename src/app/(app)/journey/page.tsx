"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthContext } from "@/providers/AuthProvider"
import { JourneyShell } from "@/components/journey/JourneyShell"
import { HomiWelcome } from "@/components/journey/HomiWelcome"
import { CompletionCelebration } from "@/components/journey/CompletionCelebration"
import {
  JOURNEY_PHASES,
  BLUEPRINT_TILES,
  getUnlockedPhases,
  getRecommendedExercise,
} from "@/lib/journey/phases"
import type {
  JourneyState,
  PhaseProgress,
  BlueprintTileData,
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
  // Build sets of completed and in-progress exercise slugs
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

  // Determine unlocked phases
  const unlockedPhases = getUnlockedPhases(completedSlugs)

  // Build phase progress
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

  // Build blueprint tiles
  const tiles: BlueprintTileData[] = BLUEPRINT_TILES.map((config) => {
    const filled = config.sourceExercises.some((slug) =>
      completedSlugs.has(slug)
    )
    const tileData: BlueprintTileData = { id: config.id, filled }

    // Add content from exercise responses for filled tiles
    if (filled) {
      const content = buildTileContent(config.id, exerciseMap)
      if (content) tileData.content = content
    }

    return tileData
  })

  // Calculate completion
  const totalExercises = JOURNEY_PHASES.flatMap((p) => p.exercises).length
  const completionPercentage =
    totalExercises > 0
      ? Math.round((completedSlugs.size / totalExercises) * 100)
      : 0

  // Find current phase (first unlocked with incomplete exercises)
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
    tiles,
    completionPercentage,
    welcomeCompleted,
    entryPath: "cold",
    recommendedExercise: recommended,
    currentPhaseId,
  }
}

function buildTileContent(
  tileId: string,
  exerciseMap: Map<string, ExerciseProgress>
): { headline: string; detail?: string } | null {
  if (tileId === "my_gems") {
    const gems = exerciseMap.get("gems_discovery")
    if (gems?.responses) {
      const goal =
        (gems.responses.primary_goal as string) ?? "Goal set"
      const timeline =
        (gems.responses.timeline as string) ?? ""
      return {
        headline: goal,
        detail: timeline ? `Timeline: ${timeline}` : undefined,
      }
    }
  }

  if (tileId === "timeline") {
    const gems = exerciseMap.get("gems_discovery")
    if (gems?.responses?.timeline) {
      return { headline: gems.responses.timeline as string }
    }
  }

  if (tileId === "ownership_type") {
    const roadmap = exerciseMap.get("roadmap_walkthrough")
    if (roadmap?.status === "completed") {
      return { headline: "TIC Co-Ownership", detail: "Roadmap complete" }
    }
  }

  if (tileId === "my_people") {
    const assessment = exerciseMap.get("cobuyer_candidate_assessment")
    if (assessment?.responses) {
      const name =
        (assessment.responses.candidate_name as string) ?? "Candidate"
      const scores = assessment.computedScores as Record<string, unknown>
      const grade = (scores?.grade as string) ?? ""
      return {
        headline: name,
        detail: grade ? `Grade: ${grade}` : "Assessed",
      }
    }
  }

  return null
}

export default function JourneyPage() {
  const { profile, isLoading: authLoading } = useAuthContext()
  const searchParams = useSearchParams()
  const router = useRouter()
  const completedSlug = searchParams.get("completed")
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null)
  const [partyData, setPartyData] = useState<PartyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const fetchJourneyData = useCallback(async () => {
    try {
      // Fetch exercises and journey data in parallel
      const [exercisesRes, journeyRes, partyRes] = await Promise.all([
        fetch("/api/exercises"),
        fetch("/api/journey"),
        fetch("/api/parties/mine"),
      ])

      const exercisesData = exercisesRes.ok
        ? await exercisesRes.json()
        : { exercises: [] }
      const journeyData = journeyRes.ok ? await journeyRes.json() : null
      const partyResult: PartyData | null = partyRes.ok ? await partyRes.json() : null
      setPartyData(partyResult)

      // The /api/journey route returns the journey record directly
      const journeyRecord = journeyData?.id ? journeyData : null
      // Use targetMarkets as a flag for welcome completion
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

      // Show welcome if not completed and no exercises started
      if (!welcomeCompleted && state.completionPercentage === 0) {
        setShowWelcome(true)
      }
    } catch (error) {
      console.error("Failed to load journey data:", error)
      // Set a default state
      setJourneyState(
        buildJourneyState([], null, false)
      )
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
    if (completedSlug && journeyState && !showWelcome) {
      setShowCelebration(true)
    }
  }, [completedSlug, journeyState, showWelcome])

  const handleDismissCelebration = useCallback(() => {
    setShowCelebration(false)
    router.replace("/journey")
  }, [router])

  const handleWelcomeComplete = useCallback(async () => {
    setShowWelcome(false)
    // Mark welcome as completed via journey PATCH
    try {
      await fetch("/api/journey", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetMarkets: [{ _welcome_completed: true }],
        }),
      })
    } catch {
      // Non-critical — don't block the user
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

  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-8"
      >
        <HomiWelcome
          displayName={profile?.full_name?.split(" ")[0] ?? null}
          entryPath="cold"
          onComplete={handleWelcomeComplete}
        />
      </motion.div>
    )
  }

  if (!journeyState) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100dvh-56px)]"
    >
      <JourneyShell
        state={journeyState}
        userName={profile?.full_name?.split(" ")[0] ?? null}
        partyData={partyData}
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
