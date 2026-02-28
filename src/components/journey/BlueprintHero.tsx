"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Home } from "lucide-react"
import { BLUEPRINT_TILES } from "@/lib/journey/phases"
import type { JourneyState, BlueprintTileConfig } from "@/lib/journey/types"
import { BlueprintTile } from "./BlueprintTile"

interface BlueprintHeroProps {
  state: JourneyState
  collapsed?: boolean
}

const TILE_GRID_ORDER = [
  "my_gems", "timeline", "home_vision",
  "my_people", "buying_party", "budget_snapshot",
  "location", "ownership_type", "financial_split",
]

const tileConfigMap = new Map<string, BlueprintTileConfig>(
  BLUEPRINT_TILES.map((t) => [t.id, t])
)

export function BlueprintHero({ state, collapsed }: BlueprintHeroProps) {
  const filledCount = state.tiles.filter((t) => t.filled).length
  const totalCount = TILE_GRID_ORDER.length
  const completionPct = Math.round((filledCount / totalCount) * 100)

  const tileDataMap = useMemo(
    () => new Map(state.tiles.map((t) => [t.id, t])),
    [state.tiles]
  )

  const isPhaseUnlocked = (phaseId: number) =>
    state.phases.some((p) => p.phaseId === phaseId && p.unlocked)

  if (collapsed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 px-4 py-2 bg-card/80 backdrop-blur-sm border-b border-border"
      >
        <CompletionRing percentage={completionPct} size={28} />
        <div className="flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">
            Your Blueprint: {completionPct}%
          </span>
        </div>
        <div className="ml-auto flex gap-1">
          {TILE_GRID_ORDER.map((tileId) => {
            const data = tileDataMap.get(tileId)
            return (
              <div
                key={tileId}
                className={`h-2 w-2 rounded-sm ${data?.filled ? "bg-primary" : "bg-muted"}`}
              />
            )
          })}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative px-4 pt-4 pb-2"
    >
      <div className="relative bg-card rounded-xl border border-border p-3 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <Home className="h-40 w-40" />
        </div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-heading font-bold text-foreground">Your Home Blueprint</h3>
          </div>
          <CompletionRing percentage={completionPct} size={36} />
        </div>
        <div className="grid grid-cols-3 gap-1.5 relative z-10">
          {TILE_GRID_ORDER.map((tileId, i) => {
            const config = tileConfigMap.get(tileId)
            const data = tileDataMap.get(tileId)
            if (!config) return null
            return (
              <BlueprintTile
                key={tileId}
                config={config}
                data={data ?? { id: tileId, filled: false }}
                unlocked={isPhaseUnlocked(config.phaseId)}
                index={i}
              />
            )
          })}
        </div>
        <div className="mt-3 relative z-10">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Agreement Progress</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CompletionRing({ percentage, size }: { percentage: number; size: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
          className="text-primary" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">{percentage}</span>
    </div>
  )
}
