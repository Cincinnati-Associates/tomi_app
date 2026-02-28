"use client"

import { motion } from "framer-motion"
import { Users, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllExercises } from "@/lib/journey/phases"
import type { PartyData } from "@/lib/journey/types"

interface PartyProgressBarProps {
  partyData: PartyData
}

const totalExercises = getAllExercises().length

export function PartyProgressBar({ partyData }: PartyProgressBarProps) {
  const { party, members } = partyData

  if (!party) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 mb-2">
        <a href="/settings/party" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border hover:border-primary/30 transition-colors">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Invite a co-buyer to start building together</span>
        </a>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 mb-2">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-1.5 shrink-0">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{party.name}</span>
        </div>
        <div className="h-4 w-px bg-border shrink-0" />
        <div className="flex items-center gap-3 overflow-x-auto min-w-0">
          {members.map((member) => (
            <MemberChip key={member.userId} name={member.name} avatarUrl={member.avatarUrl} completedCount={member.completedCount} totalExercises={totalExercises} lastActive={member.lastActive} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function MemberChip({ name, avatarUrl, completedCount, totalExercises: total, lastActive }: {
  name: string; avatarUrl: string | null; completedCount: number; totalExercises: number; lastActive: string | null
}) {
  const activityColor = getActivityColor(lastActive)
  const initials = getInitials(name)
  const firstName = name.split(" ")[0]

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", activityColor)} />
      <div className="relative h-5 w-5 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[8px] font-bold text-muted-foreground">{initials}</span>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
        {firstName} <span className="text-muted-foreground/60">({completedCount}/{total})</span>
      </span>
    </div>
  )
}

function getActivityColor(lastActive: string | null): string {
  if (!lastActive) return "bg-gray-400"
  const hours = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60)
  if (hours < 24) return "bg-green-500"
  if (hours < 168) return "bg-yellow-500"
  return "bg-gray-400"
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
