"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Map } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StepCard, type RoadmapStep } from "./StepCard"

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    number: 1,
    title: "Assess Yourself",
    description: "Understand your goals, finances, and readiness for co-ownership.",
    icon: "Search",
    details: [
      "Complete the GEMs discovery (Goals, Expectations, Motivations)",
      "Review your financial readiness",
      "Define your timeline and preferences",
    ],
    timeEstimate: "1-2 weeks",
  },
  {
    number: 2,
    title: "Find Your Co-Buyers",
    description: "Identify and assess potential co-ownership partners.",
    icon: "Users",
    details: [
      "Evaluate candidates with the co-buyer compatibility assessment",
      "Have honest conversations about finances and expectations",
      "Invite your chosen co-buyers to Tomi to form a buying party",
    ],
    timeEstimate: "2-4 weeks",
  },
  {
    number: 3,
    title: "Align on Goals",
    description: "Make sure everyone's on the same page about the big decisions.",
    icon: "Target",
    details: [
      "Complete group alignment exercises together",
      "Discuss financial contributions, ownership splits, and timelines",
      "Define house rules, decision-making, and governance",
    ],
    timeEstimate: "1-2 weeks",
  },
  {
    number: 4,
    title: "Sort Finances",
    description: "Get your financial ducks in a row — individually and as a group.",
    icon: "DollarSign",
    details: [
      "Review income, debts, credit scores, and savings",
      "Determine down payment contributions and monthly budgets",
      "Get pre-approved for a mortgage (often a joint application)",
    ],
    timeEstimate: "2-4 weeks",
  },
  {
    number: 5,
    title: "Choose Your Home",
    description: "Search for the right property that fits everyone's needs.",
    icon: "Home",
    details: [
      "Define property criteria together (location, size, type, features)",
      "Work with a real estate agent who understands co-buying",
      "Tour properties, make offers, and negotiate as a group",
    ],
    timeEstimate: "1-3 months",
  },
  {
    number: 6,
    title: "Create Your Agreement",
    description: "Build your TIC co-ownership agreement — the foundation of your partnership.",
    icon: "FileText",
    details: [
      "Tomi generates a bespoke agreement from your exercise responses",
      "Covers ownership %, finances, governance, exits, and more",
      "Review with an attorney and finalize as a group",
    ],
    timeEstimate: "1-2 weeks",
  },
  {
    number: 7,
    title: "Close & Move In",
    description: "Complete the purchase and start your co-ownership journey.",
    icon: "Key",
    details: [
      "Work with your lender, title company, and attorney to close",
      "Sign your TIC agreement alongside closing documents",
      "Move in! Your Homi stays with you for ongoing support",
    ],
    timeEstimate: "2-4 weeks",
  },
]

interface RoadmapWalkthroughProps {
  onComplete: () => void
}

export function RoadmapWalkthrough({ onComplete }: RoadmapWalkthroughProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [viewedSteps, setViewedSteps] = useState(new Set([0]))

  const handleSelectStep = useCallback(
    (index: number) => {
      setActiveStep(index)
      setViewedSteps((prev) => { const next = new Set(Array.from(prev)); next.add(index); return next })
    },
    []
  )

  const handleNext = useCallback(() => {
    if (activeStep < ROADMAP_STEPS.length - 1) {
      const next = activeStep + 1
      setActiveStep(next)
      setViewedSteps((prev) => { const s = new Set(Array.from(prev)); s.add(next); return s })
    }
  }, [activeStep])

  const handlePrev = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }, [activeStep])

  const allViewed = viewedSteps.size === ROADMAP_STEPS.length

  return (
    <div className="mx-auto max-w-[640px] px-4 pb-24">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 py-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/journey">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">
              What to Expect When Co-Buying
            </h1>
            <p className="text-xs text-muted-foreground">
              {viewedSteps.size} of {ROADMAP_STEPS.length} steps viewed
            </p>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 mt-2">
          {ROADMAP_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                viewedSteps.has(i) ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Map className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-heading font-bold text-foreground mb-2">
          The 7-Step Co-Buying Journey
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Here&apos;s what the path from exploring to owning typically looks like.
          Tap each step to learn more.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-3 mb-8">
        {ROADMAP_STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <StepCard
              step={step}
              isActive={activeStep === i}
              isCompleted={viewedSteps.has(i) && activeStep !== i}
              onSelect={() => handleSelectStep(i)}
            />
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={activeStep === 0}
          className="gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        {allViewed ? (
          <Button onClick={onComplete} className="gap-1">
            <Check className="h-3.5 w-3.5" />
            Complete Walkthrough
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={activeStep === ROADMAP_STEPS.length - 1}
            className="gap-1"
          >
            Next
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
