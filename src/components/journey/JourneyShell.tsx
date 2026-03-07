"use client"

import { useState, useCallback, useRef } from "react"
import { useIsMobile } from "@/hooks/useIsMobile"
import { useHomiChat } from "@/hooks/useHomiChat"
import { JOURNEY_ZONES } from "@/lib/journey/phases"
import type { JourneyState, PartyData } from "@/lib/journey/types"
import { ZoneSection } from "./ZoneSection"
import { PartyProgressBar } from "./PartyProgressBar"
import { FloatingChatInput } from "./FloatingChatInput"
import { JourneyChatPanel } from "./JourneyChatPanel"
import { SwipeableLayout } from "./SwipeableLayout"
import { DesktopJourneyLayout } from "./DesktopJourneyLayout"

interface JourneyShellProps {
  state: JourneyState
  userName?: string | null
  partyData?: PartyData | null
  /** Content to render above the zone cards (e.g. welcome banner) */
  topSlot?: React.ReactNode
}

export function JourneyShell({ state, partyData, topSlot }: JourneyShellProps) {
  const isMobile = useIsMobile()
  const { messages, isLoading, sendMessage } = useHomiChat({ isAuthenticated: true })
  const [chatActive, setChatActive] = useState(false)
  const [activePanel, setActivePanel] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleFloatingSubmit = useCallback((message: string) => {
    sendMessage(message)
    setChatActive(true)
    setActivePanel(1)
  }, [sendMessage])

  const handleChatSend = useCallback((content: string) => { sendMessage(content) }, [sendMessage])
  const handleToggleChat = useCallback(() => { setChatActive((prev) => !prev) }, [])
  const handlePanelChange = useCallback((panel: number) => { setActivePanel(panel) }, [])

  const hasParty = Boolean(partyData?.party)

  const journeyContent = (
    <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain" style={{ touchAction: "pan-y" }}>
      {topSlot}
      {partyData && <PartyProgressBar partyData={partyData} />}

      <div className="pt-4 pb-24">
        {JOURNEY_ZONES.map((zone) => (
          <ZoneSection
            key={zone.id}
            zone={zone}
            phases={state.phases}
            locked={zone.requiresParty && !hasParty}
            partyMembers={partyData?.members}
          />
        ))}
      </div>
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
