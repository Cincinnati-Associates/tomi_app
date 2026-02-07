"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { RoadmapWalkthrough } from "@/components/roadmap/RoadmapWalkthrough"

export default function RoadmapExercisePage() {
  const router = useRouter()

  const handleComplete = useCallback(async () => {
    try {
      await fetch("/api/exercises/roadmap_walkthrough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: { walkthrough_completed: true, viewed_all_steps: true },
          status: "completed",
        }),
      })
    } catch (error) {
      console.error("Failed to save roadmap completion:", error)
    }

    router.push("/journey")
  }, [router])

  return <RoadmapWalkthrough onComplete={handleComplete} />
}
