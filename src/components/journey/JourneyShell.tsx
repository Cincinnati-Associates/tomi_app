"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { useIsMobile } from "@/hooks/useIsMobile"
import { useHomiChat } from "@/hooks/useHomiChat"
import { JOURNEY_PHASES, flattenPhasesToTrailNodes } from "@/lib/journey/phases"
import type { JourneyState, PartyData } from "@/lib/journey/types"
import { TrailView } from "./TrailView"
import { BlueprintHero } from "./BlueprintHero"
import { PartyProgressBar } from "./PartyProgressBar"
import { FloatingChatInput } from "./FloatingChatInput"
import { JourneyChatPanel } from "./JourneyChatPanel"
import { SwipeableLayout } from "./SwipeableLayout"
import { DesktopJourneyLayout } from "./DesktopJourneyLayout"

interface JourneyShellProps {
  state: JourneyState
  userName?: string | null
  partyData?: PartyData | null
}

export function JourneyShell({ state, partyData }: JourneyShellProps) {
  const isMobile = useIsMobile()
  const { messages, isLoading, sendMessage } = useHomiChat({ isAuthenticated: true })
  const [chatActive, setChatActive] = useState(false)
  const [activePanel, setActivePanel] = useState(0)
  const [blueprintCollapsed, setBlueprintCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const trailNodes = useMemo(
    () => flattenPhasesToTrailNodes(JOURNEY_PHASES, state.phases, state.currentPhaseId, state.recommendedExercise),
    [state.phases, state.currentPhaseId, state.recommendedExercise]
  )

  const handleFloatingSubmit = useCallback((message: string) => {
    sendMessage(message)
    setChatActive(true)
    setActivePanel(1)
  }, [sendMessage])

  const handleChatSend = useCallback((content: string) => { sendMessage(content) }, [sendMessage])
  const handleToggleChat = useCallback(() => { setChatActive((prev) => !prev) }, [])
  const handlePanelChange = useCallback((panel: number) => { setActivePanel(panel) }, [])

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setBlueprintCollapsed(scrollRef.current.scrollTop > 100)
    }
  }, [])

  const journeyContent = (
    <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto overscroll-contain" style={{ touchAction: "pan-y" }}>
      <BlueprintHero state={state} collapsed={blueprintCollapsed} />
      {partyData && <PartyProgressBar partyData={partyData} />}
      <TrailView nodes={trailNodes} className="" partyMembers={partyData?.members} />
    </div>
  )

  const chatPanel = (
    <JourneyChatPanel messages={messages} isLoading={isLoading} onSend={handleChatSend} className="h-full" />
  )

  if (isMobile) {
    if (!chatActive) {
      return (
        <div className="relative h-full">
          {journeyContent}
          <FloatingChatInput onSubmit={handleFloatingSubmit} />
        </div>
      )
    }
    return (
      <SwipeableLayout trailPanel={journeyContent} chatPanel={chatPanel} activePanel={activePanel} onPanelChange={handlePanelChange} />
    )
  }

  return (
    <DesktopJourneyLayout trailPanel={journeyContent} chatPanel={chatPanel} chatActive={chatActive} onToggleChat={handleToggleChat} />
  )
}
