"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface QuickContextFormProps {
  onChange: (data: QuickContextData) => void
  isSubmitting?: boolean
}

export interface QuickContextData {
  targetTimeline: string
  coBuyerStatus: string
}

const timelineOptions = [
  { value: '3mo', label: 'Within 3 months', description: 'Ready to move quickly' },
  { value: '6mo', label: '3-6 months', description: 'Active planning phase' },
  { value: '12mo', label: '6-12 months', description: 'Getting prepared' },
  { value: '18mo+', label: '12+ months', description: 'Long-term planning' },
  { value: 'exploring', label: 'Just exploring', description: 'Learning about options' },
]

const coBuyerOptions = [
  { value: 'has_cobuyers', label: 'I have co-buyers', description: 'Friends or family ready to buy together' },
  { value: 'seeking', label: 'Looking for co-buyers', description: 'Want to find compatible partners' },
  { value: 'open', label: 'Open to either', description: 'Flexible on finding partners' },
]

export function QuickContextForm({ onChange, isSubmitting }: QuickContextFormProps) {
  const [targetTimeline, setTargetTimeline] = useState<string>('')
  const [coBuyerStatus, setCoBuyerStatus] = useState<string>('')

  const handleTimelineChange = (value: string) => {
    setTargetTimeline(value)
    onChange({ targetTimeline: value, coBuyerStatus })
  }

  const handleCoBuyerChange = (value: string) => {
    setCoBuyerStatus(value)
    onChange({ targetTimeline, coBuyerStatus: value })
  }

  return (
    <div className="space-y-8">
      {/* Timeline Question */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          When are you hoping to buy?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This helps us tailor your experience and prioritize next steps.
        </p>
        <div className="grid gap-3">
          {timelineOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleTimelineChange(option.value)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                targetTimeline === option.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div>
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              {targetTimeline === option.value && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Co-buyer Question */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Do you have co-buyers in mind?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Whether you have partners or need help finding them, we&apos;ve got you covered.
        </p>
        <div className="grid gap-3">
          {coBuyerOptions.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleCoBuyerChange(option.value)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                coBuyerStatus === option.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div>
                <div className="font-medium text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              {coBuyerStatus === option.value && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  )
}
