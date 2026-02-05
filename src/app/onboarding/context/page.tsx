"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QuickContextForm, QuickContextData } from '@/components/onboarding/QuickContextForm'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

export default function ContextPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<QuickContextData | null>(null)

  const handleFormChange = (data: QuickContextData) => {
    setFormData(data)
  }

  const handleContinue = async () => {
    if (!formData) return

    setIsSubmitting(true)

    try {
      // Save context to journey
      const response = await fetch('/api/journey', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTimeline: formData.targetTimeline,
          coBuyerStatus: formData.coBuyerStatus,
        }),
      })

      if (response.ok) {
        router.push('/onboarding/start')
      } else {
        console.error('Failed to save context')
        // Still proceed even if save fails - we can collect this later
        router.push('/onboarding/start')
      }
    } catch (error) {
      console.error('Error saving context:', error)
      // Still proceed even if save fails
      router.push('/onboarding/start')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-8"
      >
        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-2/3 bg-primary rounded-full" />
        </div>
        <span className="text-sm text-muted-foreground">Step 2 of 3</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          A bit of context
        </h1>
        <p className="text-muted-foreground">
          These two quick questions help us personalize your experience.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8"
      >
        <QuickContextForm
          onChange={handleFormChange}
        />
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-between"
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/onboarding/welcome')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/onboarding/start')}
          >
            Skip
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!formData?.targetTimeline || !formData?.coBuyerStatus || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
