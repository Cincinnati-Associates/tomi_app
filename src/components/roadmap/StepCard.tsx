"use client"

import { motion } from "framer-motion"
import {
  Search,
  Users,
  Target,
  DollarSign,
  Home,
  FileText,
  Key,
} from "lucide-react"
import { cn } from "@/lib/utils"

const stepIcons: Record<string, React.ElementType> = {
  Search,
  Users,
  Target,
  DollarSign,
  Home,
  FileText,
  Key,
}

export interface RoadmapStep {
  number: number
  title: string
  description: string
  icon: string
  details: string[]
  timeEstimate: string
}

interface StepCardProps {
  step: RoadmapStep
  isActive: boolean
  isCompleted: boolean
  onSelect: () => void
}

export function StepCard({ step, isActive, isCompleted, onSelect }: StepCardProps) {
  const Icon = stepIcons[step.icon] || Search

  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all",
        isActive
          ? "border-primary bg-primary/5 shadow-sm"
          : isCompleted
            ? "border-primary/20 bg-primary/5 opacity-80"
            : "border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
            isActive || isCompleted ? "bg-primary/10" : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              isActive || isCompleted
                ? "text-primary"
                : "text-muted-foreground"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary">
              Step {step.number}
            </span>
            <span className="text-xs text-muted-foreground">
              {step.timeEstimate}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {step.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-3 pl-[52px]"
        >
          <ul className="space-y-1.5">
            {step.details.map((detail, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="text-primary mt-0.5">-</span>
                {detail}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.button>
  )
}
