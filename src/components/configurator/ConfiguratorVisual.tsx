"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ConfiguratorVisualProps {
  children: React.ReactNode
  className?: string
}

/**
 * Pluggable visual wrapper for configurator exercises.
 * Provides the container and transition context — the actual
 * scene content is passed as children.
 */
export function ConfiguratorVisual({
  children,
  className,
}: ConfiguratorVisualProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/30 rounded-2xl overflow-hidden",
        className
      )}
    >
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
  )
}

/**
 * Transition wrapper for individual visual layers.
 * Key prop drives enter/exit animations.
 */
export function VisualLayer({
  children,
  layerKey,
}: {
  children: React.ReactNode
  layerKey: string
}) {
  return (
    <motion.g
      key={layerKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.g>
  )
}
