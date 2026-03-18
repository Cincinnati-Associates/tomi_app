"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getPendingInvite, clearPendingInvite } from "@/lib/invite-context"

/**
 * Auto-accepts a pending party invite after auth redirect.
 *
 * When a user lands on /invite/[token] unauthenticated, the token is saved
 * to sessionStorage. After they authenticate (magic link, Google, etc.) and
 * land on /journey, this hook picks up the token and calls the accept API.
 *
 * @param isAuthenticated - whether the user is currently authenticated
 * @param onAccepted - optional callback when invite is successfully accepted (e.g. to refetch party data)
 */
export function useInviteLinker(
  isAuthenticated: boolean,
  onAccepted?: () => void
) {
  const hasRun = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || hasRun.current) return

    const token = getPendingInvite()
    if (!token) return

    hasRun.current = true

    async function acceptInvite() {
      try {
        const res = await fetch(`/api/parties/invite/${token}`, {
          method: "POST",
        })

        if (res.ok) {
          clearPendingInvite()
          onAccepted?.()
          // Brief delay so the user sees the journey page before any re-render
          router.refresh()
        } else {
          const data = await res.json().catch(() => ({}))
          console.error("[useInviteLinker] Accept failed:", data.error)
          // Clear token even on failure — invite may be expired/invalid
          clearPendingInvite()
        }
      } catch (error) {
        console.error("[useInviteLinker] Error accepting invite:", error)
        // Don't clear on network error — allow retry
        hasRun.current = false
      }
    }

    acceptInvite()
  }, [isAuthenticated, onAccepted, router])
}
