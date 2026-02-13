"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle2, XCircle } from "lucide-react"
import { useAuthContext } from "@/providers/AuthProvider"

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { user } = useAuthContext()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleAccept() {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invite/${token}`)
      return
    }

    setStatus("loading")
    try {
      const res = await fetch(`/api/parties/invite/${token}`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to accept invite")
      }
      setStatus("success")
      setTimeout(() => router.push("/journey"), 2000)
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">You&apos;ve Been Invited</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in or create an account to join this buying party.
          </p>
          <Button onClick={() => router.push(`/login?redirect=/invite/${token}`)} className="w-full">
            Sign In to Accept
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === "success" ? (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">You&apos;re In!</h1>
            <p className="text-sm text-muted-foreground">
              Redirecting to your journey...
            </p>
          </>
        ) : status === "error" ? (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">Invite Error</h1>
            <p className="text-sm text-muted-foreground mb-4">{errorMsg}</p>
            <Button variant="outline" onClick={() => router.push("/journey")}>
              Go to Journey
            </Button>
          </>
        ) : (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">Join a Buying Party</h1>
            <p className="text-sm text-muted-foreground mb-6">
              You&apos;ve been invited to join a co-buying group. Accept to start
              your shared homeownership journey together.
            </p>
            <Button
              onClick={handleAccept}
              disabled={status === "loading"}
              className="w-full"
            >
              {status === "loading" ? "Joining..." : "Accept Invite"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
