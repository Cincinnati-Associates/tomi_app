"use client"

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SwipeableLayoutProps {
  trailPanel: ReactNode
  chatPanel: ReactNode
  /** Which panel to start on: 0 = trail, 1 = chat */
  activePanel: number
  onPanelChange: (panel: number) => void
}

export function SwipeableLayout({
  trailPanel,
  chatPanel,
  activePanel,
  onPanelChange,
}: SwipeableLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPanel, setCurrentPanel] = useState(activePanel)

  // Scroll to panel when activePanel prop changes
  const scrollToPanel = useCallback(
    (panel: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left: panel * containerRef.current.clientWidth,
          behavior: "smooth",
        })
      }
    },
    []
  )

  // Scroll to panel when activePanel prop changes
  useEffect(() => {
    if (activePanel !== currentPanel) {
      setCurrentPanel(activePanel)
      scrollToPanel(activePanel)
    }
  }, [activePanel]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollLeft, clientWidth } = containerRef.current
    const panel = Math.round(scrollLeft / clientWidth)
    if (panel !== currentPanel) {
      setCurrentPanel(panel)
      onPanelChange(panel)
    }
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Scroll-snap container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Panel 1: Trail */}
        <div className="w-full flex-shrink-0 snap-center snap-always overflow-hidden">
          {trailPanel}
        </div>

        {/* Panel 2: Chat */}
        <div className="w-full flex-shrink-0 snap-center snap-always overflow-hidden">
          {chatPanel}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 pb-[env(safe-area-inset-bottom)]">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => {
              scrollToPanel(i)
              onPanelChange(i)
            }}
            aria-label={i === 0 ? "Trail view" : "Chat view"}
            className={cn(
              "h-2 rounded-full transition-all duration-200",
              currentPanel === i
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  )
}
