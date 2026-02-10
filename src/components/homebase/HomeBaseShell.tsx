"use client"

import { useState } from 'react'
import { LayoutGrid, MessageSquare } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { PropertySwitcher } from './PropertySwitcher'
import { HomeBaseChat } from './HomeBaseChat'
import { HomeBaseOverview } from './HomeBaseOverview'
import { cn } from '@/lib/utils'

export function HomeBaseShell() {
  const isMobile = useIsMobile()
  const { activePartyId, isLoading } = useHomeBase()
  const [mobileView, setMobileView] = useState<'chat' | 'overview'>('chat')

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading HomeBase...</div>
      </div>
    )
  }

  if (!activePartyId) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-semibold mb-2">HomeBase Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            HomeBase unlocks after you close on a property with your co-buyers.
            Continue your journey to get there!
          </p>
        </div>
      </div>
    )
  }

  // Mobile: Full screen with view toggle
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        <PropertySwitcher />

        {/* View area */}
        <div className="flex-1 overflow-hidden">
          {mobileView === 'chat' ? <HomeBaseChat /> : <HomeBaseOverview />}
        </div>

        {/* Mobile FAB toggle */}
        <button
          onClick={() =>
            setMobileView(mobileView === 'chat' ? 'overview' : 'chat')
          }
          className={cn(
            'fixed bottom-20 right-4 z-40 flex items-center gap-2',
            'rounded-full bg-primary text-primary-foreground px-4 py-3',
            'shadow-lg hover:bg-primary/90 transition-colors',
          )}
        >
          {mobileView === 'chat' ? (
            <>
              <LayoutGrid className="h-5 w-5" />
              <span className="text-sm font-medium">Overview</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">Chat</span>
            </>
          )}
        </button>
      </div>
    )
  }

  // Desktop: Split view
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <PropertySwitcher />
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Overview */}
        <div className="w-[40%] border-r border-border overflow-hidden">
          <HomeBaseOverview />
        </div>

        {/* Right: Chat */}
        <div className="w-[60%] overflow-hidden">
          <HomeBaseChat />
        </div>
      </div>
    </div>
  )
}
