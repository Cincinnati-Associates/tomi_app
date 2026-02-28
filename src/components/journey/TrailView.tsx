"use client"

import { useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import { TrailNode } from "./TrailNode"
import type { TrailNodeMemberAvatar } from "./TrailNode"
import { TrailConnector } from "./TrailConnector"
import type { TrailNodeData, PartyMemberProgress } from "@/lib/journey/types"

interface TrailViewProps {
  nodes: TrailNodeData[]
  className?: string
  partyMembers?: PartyMemberProgress[]
}

export function TrailView({ nodes, className, partyMembers }: TrailViewProps) {
  const currentNodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentNodeRef.current) {
      const timer = setTimeout(() => {
        currentNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [nodes])

  const exerciseMemberMap = useMemo(() => {
    if (!partyMembers || partyMembers.length === 0) return null
    const map = new Map<string, TrailNodeMemberAvatar[]>()
    for (const member of partyMembers) {
      for (const ep of member.exerciseProgress) {
        if (ep.status === "completed" || ep.status === "in_progress") {
          if (!map.has(ep.slug)) map.set(ep.slug, [])
          map.get(ep.slug)!.push({ userId: member.userId, name: member.name, avatarUrl: member.avatarUrl })
        }
      }
    }
    return map
  }, [partyMembers])

  if (nodes.length === 0) return null

  return (
    <div className={className ?? ""}>
      <div className="flex flex-col items-center py-8 px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <h2 className="text-lg font-heading font-bold text-foreground">Your Journey</h2>
          <p className="text-xs text-muted-foreground mt-1">Tap a step to begin</p>
        </motion.div>

        {nodes.map((node, i) => (
          <div key={node.id} ref={node.status === "current" ? currentNodeRef : undefined}>
            {i > 0 && <TrailConnector statusBelow={node.status} />}
            <TrailNode
              node={node}
              index={i}
              memberAvatars={node.exerciseSlug ? exerciseMemberMap?.get(node.exerciseSlug) : undefined}
            />
          </div>
        ))}

        <div className="h-24 flex-shrink-0" />
      </div>
    </div>
  )
}
