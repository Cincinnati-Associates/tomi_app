"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { useAuthContext } from '@/providers/AuthProvider'
import { HomeBaseProvider, useHomeBase } from '@/providers/HomeBaseProvider'
import { HomiChatProvider } from '@/providers/HomiChatProvider'
import { AppSwipeShell } from '@/components/shared/AppSwipeShell'
import { HomiChatTrigger } from '@/components/shared/HomiChatTrigger'
import { useHomiChatContext } from '@/providers/HomiChatProvider'

function HomeBaseContent({ children }: { children: React.ReactNode }) {
  const { triggerRefresh } = useHomeBase()
  const { onToolCallRefresh, openChat, isChatOpen } = useHomiChatContext()

  // Wire up tool call refresh to HomeBase's triggerRefresh
  useEffect(() => {
    onToolCallRefresh.current = triggerRefresh
    return () => {
      onToolCallRefresh.current = null
    }
  }, [triggerRefresh, onToolCallRefresh])

  return (
    <>
      <AppSwipeShell>{children}</AppSwipeShell>
      {/* Floating Homi button — hidden when chat panel is open */}
      {!isChatOpen && (
        <HomiChatTrigger
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 md:h-16 md:w-16"
        />
      )}
    </>
  )
}

function HomeBaseInner({ children }: { children: React.ReactNode }) {
  const { activePartyId } = useHomeBase()

  return (
    <HomiChatProvider partyId={activePartyId}>
      <AppNavbar />
      <div className="homebase min-h-screen pt-14">
        <HomeBaseContent>{children}</HomeBaseContent>
      </div>
    </HomiChatProvider>
  )
}

export default function HomeBaseLayout({
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
      router.replace('/?signin=true')
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
    <HomeBaseProvider>
      <HomeBaseInner>{children}</HomeBaseInner>
    </HomeBaseProvider>
  )
}
