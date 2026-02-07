"use client"

import { useState, useCallback, useMemo } from "react"
import { useIsMobile } from "@/hooks/useIsMobile"
import { useHomiChat } from "@/hooks/useHomiChat"
import { JOURNEY_PHASES, flattenPhasesToTrailNodes } from "@/lib/journey/phases"
import type { JourneyState } from "@/lib/journey/types"
import { TrailView } from "./TrailView"
import { FloatingChatInput } from "./FloatingChatInput"
import { JourneyChatPanel } from "./JourneyChatPanel"
import { SwipeableLayout } from "./SwipeableLayout"
import { DesktopJourneyLayout } from "./DesktopJourneyLayout"

interface JourneyShellProps {
  state: JourneyState
  userName?: string | null
}

export function JourneyShell({ state }: JourneyShellProps) {
  const isMobile = useIsMobile()
  const { messages, isLoading, sendMessage } = useHomiChat({
    isAuthenticated: true,
  })
  const [chatActive, setChatActive] = useState(false)
  const [activePanel, setActivePanel] = useState(0)

  // Flatten phases into trail nodes
  const trailNodes = useMemo(
    () =>
      flattenPhasesToTrailNodes(
        JOURNEY_PHASES,
        state.phases,
        state.currentPhaseId,
        state.recommendedExercise
      ),
    [state.phases, state.currentPhaseId, state.recommendedExercise]
  )

  const handleFloatingSubmit = useCallback(
    (message: string) => {
      sendMessage(message)
      setChatActive(true)
      setActivePanel(1) // switch to chat panel
    },
    [sendMessage]
  )

  const handleChatSend = useCallback(
    (content: string) => {
      sendMessage(content)
    },
    [sendMessage]
  )

  const handleToggleChat = useCallback(() => {
    setChatActive((prev) => !prev)
  }, [])

  const handlePanelChange = useCallback((panel: number) => {
    setActivePanel(panel)
  }, [])

  // Shared trail view component
  const trailView = <TrailView nodes={trailNodes} className="h-full" />

  // Shared chat panel component
  const chatPanel = (
    <JourneyChatPanel
      messages={messages}
      isLoading={isLoading}
      onSend={handleChatSend}
      className="h-full"
    />
  )

  // ---- MOBILE LAYOUT ----
  if (isMobile) {
    if (!chatActive) {
      return (
        <div className="relative h-full">
          {trailView}
          <FloatingChatInput onSubmit={handleFloatingSubmit} />
        </div>
      )
    }

    return (
      <SwipeableLayout
        trailPanel={trailView}
        chatPanel={chatPanel}
        activePanel={activePanel}
        onPanelChange={handlePanelChange}
      />
    )
  }

  // ---- DESKTOP LAYOUT ----
  return (
    <DesktopJourneyLayout
      trailPanel={trailView}
      chatPanel={chatPanel}
      chatActive={chatActive}
      onToggleChat={handleToggleChat}
    />
  )
}
