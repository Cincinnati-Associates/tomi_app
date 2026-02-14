"use client"

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { JourneyTimeline } from '@/components/onboarding/JourneyTimeline'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useAuthContext } from '@/providers/AuthProvider'

export default function WelcomePage() {
  const router = useRouter()
  const { profile } = useAuthContext()

  const displayName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          Welcome to Tomi
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
          Hey {displayName}, let&apos;s start your co-buying journey
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          We&apos;ll guide you through a personalized journey to help you become a homeowner
          through co-ownership. Here&apos;s what the path looks like:
        </p>
      </motion.div>

      {/* Journey Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
          Your Journey to Co-Ownership
        </h2>
        <JourneyTimeline currentStage="exploring" />
      </motion.div>

      {/* What to expect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          What to expect
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
              1
            </span>
            <span>
              <strong className="text-foreground">Quick context</strong> — Tell us about your timeline and co-buyer situation (takes 1 min)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
              2
            </span>
            <span>
              <strong className="text-foreground">Readiness exercises</strong> — Short assessments to understand your financial and lifestyle fit
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
              3
            </span>
            <span>
              <strong className="text-foreground">Personalized guidance</strong> — Homi, your AI guide, will help you every step of the way
            </span>
          </li>
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          size="lg"
          onClick={() => router.push('/onboarding/context')}
          className="gap-2"
        >
          Let&apos;s get started
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push('/dashboard')}
        >
          Skip for now
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground mt-6"
      >
        You can always come back to this later from your dashboard.
      </motion.p>
    </div>
  )
}
