"use client"

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useHomiChatContext } from '@/providers/HomiChatProvider'
import { HomiChatPanel } from './HomiChatPanel'

interface AppSwipeShellProps {
  children: ReactNode
}

/**
 * Universal swipe-to-chat shell.
 *
 * Mobile: CSS scroll-snap two-panel layout. Panel 0 = page content, Panel 1 = Homi chat.
 * Desktop: Page content fills screen. Chat is a slide-in right panel.
 */
export function AppSwipeShell({ children }: AppSwipeShellProps) {
  const isMobile = useIsMobile()
  const { isChatOpen, openChat, closeChat, scrollToChatRef } = useHomiChatContext()

  if (isMobile) {
    return (
      <MobileSwipeShell onOpenChat={openChat} onCloseChat={closeChat} scrollToChatRef={scrollToChatRef}>
        {children}
      </MobileSwipeShell>
    )
  }

  return (
    <DesktopShell isOpen={isChatOpen} onClose={closeChat}>
      {children}
    </DesktopShell>
  )
}

// =============================================================================
// Mobile: Scroll-snap two-panel layout
// =============================================================================

function MobileSwipeShell({
  children,
  onOpenChat,
  onCloseChat,
  scrollToChatRef,
}: {
  children: ReactNode
  onOpenChat: () => void
  onCloseChat: () => void
  scrollToChatRef: React.MutableRefObject<(() => void) | null>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPanel, setCurrentPanel] = useState(0)

  const scrollToPanel = useCallback((panel: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: panel * containerRef.current.clientWidth,
        behavior: 'smooth',
      })
    }
  }, [])

  // Register scroll-to-chat function on the provider ref
  useEffect(() => {
    scrollToChatRef.current = () => scrollToPanel(1)
    return () => {
      scrollToChatRef.current = null
    }
  }, [scrollToPanel, scrollToChatRef])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollLeft, clientWidth } = containerRef.current
    const panel = Math.round(scrollLeft / clientWidth)
    if (panel !== currentPanel) {
      setCurrentPanel(panel)
      if (panel === 1) onOpenChat()
      else onCloseChat()
    }
  }

  return (
    <div className="relative flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Scroll-snap container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Panel 0: Page content */}
        <div className="w-full flex-shrink-0 snap-center snap-always overflow-y-auto">
          {children}
        </div>

        {/* Panel 1: Homi Chat */}
        <div className="w-full flex-shrink-0 snap-center snap-always overflow-hidden">
          <div className="h-full rounded-2xl border-4 border-primary m-1.5">
            <HomiChatPanel />
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 pb-[env(safe-area-inset-bottom)]">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => {
              scrollToPanel(i)
              if (i === 1) onOpenChat()
              else onCloseChat()
            }}
            aria-label={i === 0 ? 'Content' : 'Chat with Homi'}
            className={cn(
              'h-2 rounded-full transition-all duration-200',
              currentPanel === i
                ? 'w-6 bg-primary'
                : 'w-2 bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Desktop: Slide-in right panel
// =============================================================================

function DesktopShell({
  children,
  isOpen,
  onClose,
}: {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <div className="relative h-[calc(100vh-3.5rem)] flex">
      {/* Main content */}
      <div
        className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          isOpen ? 'mr-[480px]' : 'mr-0'
        )}
      >
        {children}
      </div>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed top-14 right-0 bottom-0 w-[480px] z-40',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-full rounded-l-2xl border-4 border-r-0 border-primary bg-background shadow-2xl">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={onClose}
              className="rounded-full bg-muted/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
          <HomiChatPanel />
        </div>
      </div>

      {/* Backdrop for desktop (subtle) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/5"
          onClick={onClose}
        />
      )}
    </div>
  )
}
