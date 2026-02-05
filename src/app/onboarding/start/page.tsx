"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExercisePrompt } from '@/components/onboarding/ExercisePrompt'
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { useAuthContext } from '@/providers/AuthProvider'

export default function StartPage() {
  const router = useRouter()
  const { refreshProfile } = useAuthContext()
  const [isCompleting, setIsCompleting] = useState(false)

  const handleStartExercise = (slug: string) => {
    // TODO: Navigate to exercise when implemented
    // For now, show a message that exercises are coming soon
    alert(`Exercise "${slug}" coming soon! For now, continue to the dashboard.`)
  }

  const handleComplete = async () => {
    setIsCompleting(true)

    try {
      // Mark onboarding as complete
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: undefined, // Don't change the name
        }),
      })

      // Refresh profile to get updated onboarding status
      await refreshProfile()

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still proceed to dashboard
      router.push('/dashboard')
    } finally {
      setIsCompleting(false)
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
          <div className="h-full w-full bg-primary rounded-full" />
        </div>
        <span className="text-sm text-muted-foreground">Step 3 of 3</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Ready to dive deeper?
        </h1>
        <p className="text-muted-foreground">
          Complete these short exercises to unlock personalized insights and improve your co-buyer matching.
        </p>
      </motion.div>

      {/* Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8"
      >
        <ExercisePrompt onStartExercise={handleStartExercise} />
      </motion.div>

      {/* Homi hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> You can complete these exercises anytime from your dashboard.
              Homi, your AI guide, will remind you when you&apos;re ready.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-between"
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/onboarding/context')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleComplete}
          disabled={isCompleting}
          className="gap-2"
        >
          {isCompleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
