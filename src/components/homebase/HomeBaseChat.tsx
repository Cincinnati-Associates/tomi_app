"use client"

import { useRef, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { useHomeBaseChat } from '@/hooks/useHomeBaseChat'
import { HomeBaseChatInput } from './HomeBaseChatInput'
import { QuickActions } from './QuickActions'
import { ToolResultCard } from './ToolResultCard'
import { DocumentUpload } from './DocumentUpload'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { HOMEBASE_WELCOME_MESSAGE } from '@/lib/homebase/prompts'

export function HomeBaseChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    quickActions,
    sendQuickAction,
    onDocumentUploaded,
  } = useHomeBaseChat()
  const { parties, activePartyId } = useHomeBase()

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Get co-owner names for welcome message
  const activeParty = parties.find((p) => p.id === activePartyId)
  const welcomeText = HOMEBASE_WELCOME_MESSAGE(activeParty?.members || [])

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">H</span>
            </div>
            <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3 max-w-[85%]">
              <div className="text-[15px] leading-relaxed text-foreground homebase-prose">
                <ReactMarkdown>{welcomeText}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message) => {
          const isUser = message.role === 'user'

          // Check for tool invocations/results
          const toolInvocations = (message as unknown as Record<string, unknown>).toolInvocations as
            | Array<{ toolName: string; state: string; result?: Record<string, unknown> }>
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
                  <div className={cn(
                    'text-[15px] leading-relaxed',
                    isUser ? '' : 'homebase-prose'
                  )}>
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
        {/* Quick actions (only show when no messages or not loading) */}
        {!isLoading && (
          <QuickActions
            actions={quickActions}
            onAction={sendQuickAction}
            onUpload={() => setIsUploadOpen(true)}
          />
        )}

        {/* Input */}
        <HomeBaseChatInput
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onAttach={() => setIsUploadOpen(true)}
          isLoading={isLoading}
        />
      </div>

      {/* Upload modal */}
      <DocumentUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={onDocumentUploaded}
      />
    </div>
  )
}
