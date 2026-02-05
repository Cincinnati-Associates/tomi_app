"use client"

import { motion } from 'framer-motion'
import { DollarSign, Home, Users, Calendar, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Exercise {
  slug: string
  name: string
  description: string
  estimatedMinutes: number
  icon: React.ElementType
  isRequired: boolean
}

const exercises: Exercise[] = [
  {
    slug: 'financial_readiness',
    name: 'Financial Readiness',
    description: 'Understand your buying power and get a DTI calculation',
    estimatedMinutes: 5,
    icon: DollarSign,
    isRequired: true,
  },
  {
    slug: 'housing_preferences',
    name: 'Housing Preferences',
    description: 'Define your ideal home and neighborhood priorities',
    estimatedMinutes: 8,
    icon: Home,
    isRequired: true,
  },
  {
    slug: 'lifestyle_arrangement',
    name: 'Lifestyle & Living',
    description: 'Share your living style for compatible matching',
    estimatedMinutes: 6,
    icon: Users,
    isRequired: false,
  },
  {
    slug: 'timeline_commitment',
    name: 'Timeline & Commitment',
    description: 'Clarify your readiness and ownership goals',
    estimatedMinutes: 4,
    icon: Calendar,
    isRequired: true,
  },
]

interface ExercisePromptProps {
  onStartExercise: (slug: string) => void
  className?: string
}

export function ExercisePrompt({ onStartExercise, className }: ExercisePromptProps) {
  const totalMinutes = exercises.reduce((sum, ex) => sum + ex.estimatedMinutes, 0)
  const requiredCount = exercises.filter(ex => ex.isRequired).length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>~{totalMinutes} min total</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span>{requiredCount} required exercises</span>
      </div>

      {/* Exercise Cards */}
      <div className="grid gap-4">
        {exercises.map((exercise, index) => {
          const Icon = exercise.icon

          return (
            <motion.button
              key={exercise.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onStartExercise(exercise.slug)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                  {exercise.isRequired && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Required
                    </span>
                  )}
                </div>
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
