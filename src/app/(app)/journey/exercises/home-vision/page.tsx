"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Home, ArrowRight, Users, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ConfiguratorShell } from "@/components/configurator/ConfiguratorShell"
import { HomeVisionScene } from "@/components/configurator/visuals/HomeVisionScene"
import { HOME_VISION_STAGES, QUESTION_SUBTEXT } from "@/lib/home-vision-exercise/stages"
import {
  mapAnswersToVisual,
  type HomeVisionVisualState,
} from "@/lib/home-vision-exercise/visual-mappings"

function VisionCard({
  answers,
  visualState,
}: {
  answers: Record<string, unknown>
  visualState: HomeVisionVisualState
}) {
  const [partyState, setPartyState] = useState<
    "idle" | "creating" | "created" | "error"
  >("idle")
  const [inviteUrl, setInviteUrl] = useState("")
  const [copied, setCopied] = useState(false)

  async function handleStartParty() {
    setPartyState("creating")
    try {
      const locationLabel =
        (answers.location_vibe as string) ?? "our future home"
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${locationLabel.charAt(0).toUpperCase() + locationLabel.slice(1)} Home`,
          targetCity: answers.location_vibe as string,
          targetBudget: null,
        }),
      })
      if (!res.ok) throw new Error("Failed to create party")
      const data = await res.json()
      setInviteUrl(data.inviteUrl || "")
      setPartyState("created")
    } catch {
      setPartyState("error")
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const labels: Record<string, Record<string, string>> = {
    home_type: {
      house: "House",
      condo: "Condo / Apartment",
      townhouse: "Townhouse",
      vacation: "Vacation Home",
    },
    location_vibe: {
      city: "City / Urban",
      suburbs: "Suburbs",
      mountains: "Mountains / Rural",
      beach: "Beach / Coastal",
    },
    relationship_type: {
      friends: "Friends",
      family: "Family",
      partners: "Partner(s)",
      mixed: "Mix of relationships",
    },
    usage_pattern: {
      cohabitation: "Living together",
      timeshare: "Time-sharing",
      mixed: "Mix of both",
    },
    home_style: {
      modern: "Modern",
      classic: "Classic / Traditional",
      rustic: "Cozy / Rustic",
    },
    budget_range: {
      tier1: "Up to $500k",
      tier2: "$500k–$1M",
      tier3: "$1M–$2M",
      tier4: "$2M+",
      unsure: "TBD",
    },
    timeline: {
      ready_now: "Ready now",
      this_year: "This year",
      "1_2_years": "1–2 years",
      exploring: "Exploring",
    },
  }

  const summaryItems = [
    {
      label: "Home Type",
      value: labels.home_type[answers.home_type as string],
    },
    {
      label: "Location",
      value: labels.location_vibe[answers.location_vibe as string],
    },
    {
      label: "Style",
      value: labels.home_style[answers.home_style as string],
    },
    {
      label: "Co-owners",
      value: answers.cobuyer_count ? `${answers.cobuyer_count} people` : undefined,
    },
    {
      label: "Relationship",
      value: labels.relationship_type[answers.relationship_type as string],
    },
    {
      label: "Usage",
      value: labels.usage_pattern[answers.usage_pattern as string],
    },
    {
      label: "Budget",
      value: labels.budget_range[answers.budget_range as string],
    },
    {
      label: "Timeline",
      value: labels.timeline[answers.timeline as string],
    },
  ].filter((item) => item.value)

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Home className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">
          Your Shared Home Vision
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what you&apos;re building toward
        </p>
      </motion.div>

      {/* Vision illustration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden bg-muted/30 mb-6"
      >
        <HomeVisionScene visualState={visualState} />
      </motion.div>

      {/* Summary list */}
      <div className="space-y-3 mb-8">
        {summaryItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-border p-4"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium text-foreground">
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3"
      >
        <Link href="/journey?completed=shared_home_vision">
          <Button className="w-full gap-2">
            Continue Your Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        {/* Start a Buying Party CTA */}
        {partyState === "idle" && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleStartParty}
          >
            <Users className="h-4 w-4" />
            Start a Buying Party
          </Button>
        )}

        {partyState === "creating" && (
          <Button variant="outline" className="w-full" disabled>
            Creating your party...
          </Button>
        )}

        {partyState === "created" && inviteUrl && (
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Party Created!
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with your co-buyers to invite them:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 text-foreground truncate border border-border"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Link expires in 7 days.
            </p>
          </div>
        )}

        {partyState === "error" && (
          <div className="text-center">
            <p className="text-xs text-red-500 mb-2">
              Failed to create party. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPartyState("idle")}
            >
              Retry
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function HomeVisionExercisePage() {
  const [savedAnswers, setSavedAnswers] = useState<
    Record<string, unknown> | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved state
  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch("/api/exercises/shared_home_vision")
        if (res.ok) {
          const data = await res.json()
          if (
            data.response?.status === "in_progress" &&
            data.response?.responses
          ) {
            setSavedAnswers(data.response.responses as Record<string, unknown>)
          }
        }
      } catch {
        // No saved state
      } finally {
        setIsLoading(false)
      }
    }
    loadSaved()
  }, [])

  const handleComplete = useCallback(
    async (answers: Record<string, unknown>) => {
      try {
        await fetch("/api/exercises/shared_home_vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: answers,
            status: "completed",
          }),
        })
      } catch (error) {
        console.error("Failed to save Home Vision:", error)
      }
    },
    []
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ConfiguratorShell<HomeVisionVisualState>
      title="Shared Home Vision Builder"
      exerciseSlug="shared_home_vision"
      stages={HOME_VISION_STAGES}
      visualMapping={mapAnswersToVisual}
      VisualComponent={HomeVisionScene}
      onComplete={handleComplete}
      savedAnswers={savedAnswers}
      questionSubtext={QUESTION_SUBTEXT}
    >
      {({ answers, visualState }) => (
        <VisionCard answers={answers} visualState={visualState} />
      )}
    </ConfiguratorShell>
  )
}
