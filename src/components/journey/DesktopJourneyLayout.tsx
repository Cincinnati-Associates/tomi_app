"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DesktopJourneyLayoutProps {
  trailPanel: ReactNode
  chatPanel: ReactNode
  chatActive: boolean
  onToggleChat: () => void
}

export function DesktopJourneyLayout({
  trailPanel,
  chatPanel,
  chatActive,
  onToggleChat,
}: DesktopJourneyLayoutProps) {
  return (
    <div className="flex h-full">
      {/* Trail panel — takes remaining space */}
      <div
        className={cn(
          "flex-1 overflow-hidden transition-all duration-300",
          chatActive ? "mr-0" : ""
        )}
      >
        {trailPanel}
      </div>

      {/* Chat sidebar */}
      <AnimatePresence>
        {chatActive && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "40%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative border-l border-border overflow-hidden flex-shrink-0"
            style={{ maxWidth: 480, minWidth: 320 }}
          >
            {/* Close sidebar button */}
            <button
              onClick={onToggleChat}
              className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            {chatPanel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle chat button (when closed) */}
      {!chatActive && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={onToggleChat}
          className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}
