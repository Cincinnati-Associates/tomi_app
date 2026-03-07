"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { getExercisesForZone } from "@/lib/journey/phases"
import type {
  JourneyZone,
  PhaseProgress,
  ExerciseProgress,
  PartyMemberProgress,
} from "@/lib/journey/types"
import { ExerciseCard } from "./ExerciseCard"
import type { ExerciseCardMemberAvatar } from "./ExerciseCard"

interface ZoneSectionProps {
  zone: JourneyZone
  phases: PhaseProgress[]
  locked?: boolean
  partyMembers?: PartyMemberProgress[]
}

export function ZoneSection({
  zone,
  phases,
  locked,
  partyMembers,
}: ZoneSectionProps) {
  const exercises = useMemo(() => getExercisesForZone(zone.id), [zone.id])

  // Build a map of exercise slug -> ExerciseProgress from the phases
  const progressMap = useMemo(() => {
    const map = new Map<string, ExerciseProgress>()
    for (const phase of phases) {
      if (zone.phaseIds.includes(phase.phaseId)) {
        for (const ep of phase.exerciseProgress) {
          map.set(ep.slug, ep)
        }
      }
    }
    return map
  }, [phases, zone.phaseIds])

  // Build member avatar map per exercise
  const memberAvatarMap = useMemo(() => {
    if (!partyMembers || partyMembers.length === 0) return null
    const map = new Map<string, ExerciseCardMemberAvatar[]>()
    for (const member of partyMembers) {
      for (const ep of member.exerciseProgress) {
        if (ep.status === "completed" || ep.status === "in_progress") {
          if (!map.has(ep.slug)) map.set(ep.slug, [])
          map.get(ep.slug)!.push({
            userId: member.userId,
            name: member.name,
            avatarUrl: member.avatarUrl,
          })
        }
      }
    }
    return map
  }, [partyMembers])

  const completedCount = Array.from(progressMap.values()).filter(
    (p) => p.status === "completed"
  ).length
  const totalCount = exercises.length

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 mb-6"
    >
      {/* Zone header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />}
          <div>
            <h3
              className={cn(
                "text-sm font-heading font-bold",
                locked ? "text-muted-foreground/50" : "text-foreground"
              )}
            >
              {zone.name}
            </h3>
            <p
              className={cn(
                "text-[11px]",
                locked
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground"
              )}
            >
              {locked ? "Requires a buying party" : zone.subtitle}
            </p>
          </div>
        </div>
        {!locked && totalCount > 0 && (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {completedCount} of {totalCount}
          </span>
        )}
      </div>

      {/* Exercise cards */}
      <div
        className={cn(
          "flex gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3",
          "overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0",
          "-mx-4 px-4 sm:mx-0 sm:px-0"
        )}
      >
        {exercises.map((exercise, i) => {
          const progress = progressMap.get(exercise.slug) ?? {
            slug: exercise.slug,
            status: "not_started" as const,
            version: 0,
            completedAt: null,
          }
          return (
            <ExerciseCard
              key={exercise.slug}
              exercise={exercise}
              progress={progress}
              locked={locked}
              index={i}
              memberAvatars={
                memberAvatarMap?.get(exercise.slug) ?? undefined
              }
            />
          )
        })}
      </div>
    </motion.section>
  )
}
