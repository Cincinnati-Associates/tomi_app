"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppNavbar } from "@/components/layout/AppNavbar"
import { useAuthContext } from "@/providers/AuthProvider"

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useAuthContext()
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setTimedOut(true), 5000)
    return () => clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    if (timedOut || (!isLoading && !isAuthenticated)) {
      router.replace("/?signin=true")
    }
  }, [timedOut, isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen pt-14">{children}</div>
    </>
  )
}
