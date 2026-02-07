"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { TrailNode } from "./TrailNode"
import { TrailConnector } from "./TrailConnector"
import type { TrailNodeData } from "@/lib/journey/types"

interface TrailViewProps {
  nodes: TrailNodeData[]
  className?: string
}

export function TrailView({ nodes, className }: TrailViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentNodeRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current node on mount
  useEffect(() => {
    if (currentNodeRef.current && containerRef.current) {
      const timer = setTimeout(() => {
        currentNodeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 500) // wait for entrance animations
      return () => clearTimeout(timer)
    }
  }, [nodes])

  if (nodes.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto overscroll-contain ${className ?? ""}`}
      style={{ touchAction: "pan-y" }}
    >
      <div className="flex flex-col items-center py-8 px-4 min-h-full">
        {/* Trail header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h2 className="text-lg font-heading font-bold text-foreground">
            Your Journey
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tap a step to begin
          </p>
        </motion.div>

        {/* Trail nodes */}
        {nodes.map((node, i) => (
          <div
            key={node.id}
            ref={node.status === "current" ? currentNodeRef : undefined}
          >
            {/* Connector above (not for first node) */}
            {i > 0 && <TrailConnector statusBelow={node.status} />}

            <TrailNode node={node} index={i} />
          </div>
        ))}

        {/* Bottom padding for floating input clearance */}
        <div className="h-24 flex-shrink-0" />
      </div>
    </div>
  )
}
