"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Search, BookOpen, Wrench, Target, Users, Home } from 'lucide-react'

const stages = [
  {
    id: 'exploring',
    label: 'Exploring',
    description: 'Learning about co-buying',
    icon: Search,
  },
  {
    id: 'educating',
    label: 'Educating',
    description: 'Understanding your options',
    icon: BookOpen,
  },
  {
    id: 'preparing',
    label: 'Preparing',
    description: 'Getting financially ready',
    icon: Wrench,
  },
  {
    id: 'ready',
    label: 'Ready',
    description: 'Prepared to find co-buyers',
    icon: Target,
  },
  {
    id: 'in_group',
    label: 'In Group',
    description: 'Matched with co-buyers',
    icon: Users,
  },
  {
    id: 'owner',
    label: 'Owner',
    description: 'Co-ownership complete',
    icon: Home,
  },
]

interface JourneyTimelineProps {
  currentStage?: string
  className?: string
}

export function JourneyTimeline({ currentStage = 'exploring', className }: JourneyTimelineProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage)

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Vertical timeline */}
      <div className="md:hidden space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const isPast = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* Timeline line and dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isPast && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-primary/10 border-primary text-primary",
                    isFuture && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-12",
                      isPast ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Stage info */}
              <div className="pt-1.5">
                <h3
                  className={cn(
                    "font-semibold",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </h3>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Desktop: Horizontal timeline */}
      <div className="hidden md:block">
        <div className="flex justify-between items-start">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isPast = index < currentIndex
            const isCurrent = index === currentIndex
            const isFuture = index > currentIndex

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center flex-1"
              >
                {/* Dot and line */}
                <div className="flex items-center w-full">
                  {/* Left line */}
                  {index > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isPast || isCurrent ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}

                  {/* Dot */}
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0",
                      isPast && "bg-primary border-primary text-primary-foreground",
                      isCurrent && "bg-primary/10 border-primary text-primary ring-4 ring-primary/20",
                      isFuture && "bg-muted border-border text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Right line */}
                  {index < stages.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isPast ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Stage info */}
                <div className="text-center mt-3 px-2">
                  <h3
                    className={cn(
                      "font-semibold text-sm",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[100px]">
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
