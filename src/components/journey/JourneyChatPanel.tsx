"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowUp, Loader2, Sparkles } from "lucide-react"
import { ChatMarkdown } from "@/components/shared/ChatMarkdown"
import type { ChatMessage } from "@/types"

interface JourneyChatPanelProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSend: (content: string) => void
  className?: string
}

const SUGGESTED_PROMPTS = [
  { label: "What should I do first?" },
  { label: "Explain co-ownership basics" },
  { label: "How long does this process take?" },
]

export function JourneyChatPanel({
  messages,
  isLoading,
  onSend,
  className,
}: JourneyChatPanelProps) {
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll within the chat container (not the page) on new messages
  useEffect(() => {
    if (!userHasScrolled && messagesScrollRef.current) {
      messagesScrollRef.current.scrollTo({
        top: messagesScrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, userHasScrolled])

  // Reset scroll lock on user message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.role === "user") {
      setUserHasScrolled(false)
    }
  }, [messages])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setUserHasScrolled(!isAtBottom)
  }

  const handleSubmit = () => {
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue.trim())
      setInputValue("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Homi</span>
        <span className="text-xs text-muted-foreground">Your journey guide</span>
      </div>

      {/* Messages area */}
      <div
        ref={messagesScrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 overscroll-contain"
      >
        {messages.length === 0 && !isLoading ? (
          /* Empty state with suggested prompts */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Ask Homi anything
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
              I can help you understand your journey, explain exercises, or answer
              co-ownership questions.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => onSend(prompt.label)}
                  className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm text-left border border-border transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {message.role === "assistant" ? (
                  <div className="flex gap-2 max-w-[95%]">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-md px-3 py-2 text-sm leading-relaxed text-foreground">
                      <ChatMarkdown content={message.content} />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 text-sm">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role === "user") && (
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-md px-3 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex-shrink-0">
        <div className="flex items-end gap-2 bg-muted rounded-xl p-1.5 pl-3">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Homi..."
            className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[36px] max-h-[80px] py-1.5 text-foreground placeholder:text-muted-foreground"
            style={{ fontSize: "16px" }}
            rows={1}
            disabled={isLoading}
          />
          <motion.button
            type="button"
            disabled={!inputValue.trim() || isLoading}
            onClick={handleSubmit}
            className="h-8 w-8 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center justify-center flex-shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
