"use client"

import { useRef, useEffect } from 'react'
import { Loader2, Mic, MicOff, Send, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { useHomiChatContext } from '@/providers/HomiChatProvider'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { ToolResultCard } from '@/components/homebase/ToolResultCard'

/**
 * The Homi chat panel rendered inside AppSwipeShell.
 * Snapchat-style bordered chat with voice input.
 */
interface HomiChatPanelProps {
  onClose?: () => void
}

export function HomiChatPanel({ onClose }: HomiChatPanelProps) {
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    quickActions,
    sendMessage,
  } = useHomiChatContext()

  const { isListening, transcript, isSupported, startListening, stopListening } =
    useVoiceInput()

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Pipe voice transcript into input
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript, setInput])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleMicToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
            <span className="text-sm font-bold text-primary">H</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Homi</h3>
            <p className="text-xs text-muted-foreground">Your home assistant</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">H</span>
            </div>
            <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3 max-w-[85%]">
              <p className="text-[15px] leading-relaxed text-foreground">
                Hi! I&apos;m Homi, your home assistant. I can help you manage tasks,
                search documents, and answer questions about your home. What can I
                help with?
              </p>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message) => {
          const isUser = message.role === 'user'

          // Check for tool invocations
          const toolInvocations = (
            message as unknown as Record<string, unknown>
          ).toolInvocations as
            | Array<{
                toolName: string
                state: string
                result?: Record<string, unknown>
              }>
            | undefined

          return (
            <div key={message.id}>
              <div
                className={cn(
                  'flex gap-3',
                  isUser ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Homi avatar */}
                {!isUser && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">H</span>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 max-w-[85%]',
                    isUser
                      ? 'rounded-tr-md bg-primary text-primary-foreground'
                      : 'rounded-tl-md bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'text-[15px] leading-relaxed',
                      isUser ? '' : 'homebase-prose'
                    )}
                  >
                    {isUser ? (
                      message.content
                    ) : (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>

              {/* Tool results rendered inline */}
              {toolInvocations?.map((invocation, i) => {
                if (invocation.state === 'result' && invocation.result) {
                  return (
                    <div key={i} className="ml-11 mt-1">
                      <ToolResultCard
                        toolName={invocation.toolName}
                        result={invocation.result}
                      />
                    </div>
                  )
                }
                return null
              })}
            </div>
          )
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <span className="text-sm font-semibold text-primary">H</span>
            </div>
            <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Homi is thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom area: quick actions + input */}
      <div className="border-t border-border bg-background px-4 py-3 space-y-3">
        {/* Quick actions */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) =>
              action.message ? (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.message)}
                  className="rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {action.label}
                </button>
              ) : null
            )}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Mic button */}
          {isSupported && (
            <button
              type="button"
              onClick={handleMicToggle}
              className={cn(
                'flex-shrink-0 flex items-center justify-center rounded-xl transition-all',
                'h-12 w-12',
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              )}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              data-homi-chat-input
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? 'Listening...' : 'Ask Homi anything...'
              }
              rows={1}
              className={cn(
                'w-full rounded-2xl border border-border bg-background px-4 py-3',
                'text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/30',
                'placeholder:text-muted-foreground/60',
                'min-h-[48px] max-h-[120px]'
              )}
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'flex-shrink-0 flex items-center justify-center rounded-xl transition-colors',
              'h-12 w-12',
              input.trim() && !isLoading
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
