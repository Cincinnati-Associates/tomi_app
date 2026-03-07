"use client"

import { motion } from 'framer-motion'
import { Gem, Home, Route, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JOURNEY_PHASES } from '@/lib/journey/phases'

const iconMap: Record<string, React.ElementType> = { Gem, Home, Route }

// Pull the Discover zone exercises directly from phase definitions
const exercises = JOURNEY_PHASES.find((p) => p.id === 0)?.exercises ?? []

interface ExercisePromptProps {
  onStartExercise: (route: string) => void
  className?: string
}

export function ExercisePrompt({ onStartExercise, className }: ExercisePromptProps) {
  const totalMinutes = exercises.reduce((sum, ex) => sum + ex.estimatedMinutes, 0)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>~{totalMinutes} min total</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span>{exercises.length} exercises</span>
      </div>

      {/* Exercise Cards */}
      <div className="grid gap-4">
        {exercises.map((exercise, index) => {
          const Icon = iconMap[exercise.icon] || Gem

          return (
            <motion.button
              key={exercise.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onStartExercise(`/journey/exercises/${exercise.route}`)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {exercise.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{exercise.estimatedMinutes} min
                </p>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
