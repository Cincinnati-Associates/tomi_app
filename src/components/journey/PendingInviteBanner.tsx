"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PendingInvite {
  token: string
  partyName: string
  inviterName: string
}

interface PendingInviteBannerProps {
  invites: PendingInvite[]
  onAccepted: () => void
}

export function PendingInviteBanner({ invites, onAccepted }: PendingInviteBannerProps) {
  const [accepting, setAccepting] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (dismissed || invites.length === 0) return null

  async function handleAccept(token: string) {
    setAccepting(token)
    setError(null)

    try {
      const res = await fetch(`/api/parties/invite/${token}`, {
        method: "POST",
      })

      if (res.ok) {
        onAccepted()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to accept invite")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setAccepting(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3"
    >
      {invites.map((invite) => (
        <div
          key={invite.token}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Users className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">{invite.inviterName}</span> invited you to join{" "}
              <span className="font-medium">{invite.partyName}</span>
            </p>
            {error && (
              <p className="text-xs text-destructive mt-0.5">{error}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => handleAccept(invite.token)}
              disabled={accepting !== null}
            >
              {accepting === invite.token ? "Joining..." : "Accept"}
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  )
}
