"use client"

import { useRef, useEffect, useState } from 'react'
import {
  Loader2,
  Send,
  Search,
  RotateCcw,
  User,
  Users,
  MessageSquare,
  ClipboardList,
  FileText,
  ChevronDown,
  ChevronUp,
  Headset,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { useSupportHomiChat, type QuickAction } from '@/hooks/useSupportHomiChat'

// ---------------------------------------------------------------------------
// Tool Result Card
// ---------------------------------------------------------------------------

const TOOL_META: Record<
  string,
  { label: string; icon: typeof User; color: string }
> = {
  lookupUser: { label: 'User Lookup', icon: User, color: 'blue' },
  lookupParty: { label: 'Party Lookup', icon: Users, color: 'violet' },
  getUserChatHistory: {
    label: 'Chat History',
    icon: MessageSquare,
    color: 'amber',
  },
  getExerciseDetails: {
    label: 'Exercise Details',
    icon: ClipboardList,
    color: 'green',
  },
  getFullUserBriefing: {
    label: 'Full Briefing',
    icon: FileText,
    color: 'indigo',
  },
}

function SupportToolCard({
  toolName,
  result,
}: {
  toolName: string
  result: Record<string, unknown>
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const meta = TOOL_META[toolName] || {
    label: toolName,
    icon: Search,
    color: 'gray',
  }
  const Icon = meta.icon

  // Build summary text
  let summary = ''
  if (result.found === false) {
    summary = String(result.message || 'No results found')
  } else if (result.multiple === true) {
    summary = `Found ${result.count} matches`
  } else if (result.denied === true) {
    summary = String(result.message || 'Access denied')
  } else if (result.error === true) {
    summary = String(result.message || 'Error')
  } else if (toolName === 'lookupUser' && result.profile) {
    const profile = result.profile as Record<string, unknown>
    summary = `${profile.name || 'Unknown'} (${profile.email || 'no email'})`
  } else if (toolName === 'lookupParty' && result.party) {
    const party = result.party as Record<string, unknown>
    summary = `${party.name} — ${party.status}`
    if (result.members) {
      summary += ` (${(result.members as unknown[]).length} members)`
    }
  } else if (toolName === 'getUserChatHistory') {
    summary = `${result.count || 0} conversations`
  } else if (toolName === 'getExerciseDetails') {
    summary = `${result.count || 0} exercise responses`
  } else if (toolName === 'getFullUserBriefing') {
    const sources = result.dataSources as string[] | undefined
    summary = sources
      ? `Assembled from: ${sources.join(', ')}`
      : 'Full briefing loaded'
  }

  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    violet:
      'border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400',
    amber:
      'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    green:
      'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    indigo:
      'border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
    gray: 'border-border text-muted-foreground',
  }[meta.color]

  return (
    <div className={cn('rounded-lg border bg-card/50 my-1', colorClasses)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-xs font-medium truncate">{meta.label}</span>
          <span className="text-xs text-muted-foreground truncate">
            {summary}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-3 pb-2 border-t border-border/50">
          <pre className="text-xs text-muted-foreground overflow-auto max-h-48 mt-2 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SupportChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    quickActions,
    sendQuickAction,
    clearChat,
  } = useSupportHomiChat()

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
            <Headset className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Support Homi
            </h1>
            <p className="text-xs text-muted-foreground">
              Look up users, parties, and data
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New session
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 mx-auto">
                <Headset className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Support Homi
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                I can look up any user or party and help you understand their
                situation. Try one of these to get started:
              </p>
            </div>
            <div className="grid gap-2 w-full max-w-md">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.label}
                  action={action}
                  onAction={sendQuickAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message) => {
          const isUser = message.role === 'user'

          // Tool invocations
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 flex-shrink-0 mt-0.5">
                    <Headset className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                )}

                {/* Message bubble */}
                {message.content && (
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
                        !isUser && 'prose prose-sm dark:prose-invert max-w-none'
                      )}
                    >
                      {isUser ? (
                        message.content
                      ) : (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tool results */}
              {toolInvocations?.map((invocation, i) => {
                if (invocation.state === 'result' && invocation.result) {
                  return (
                    <div key={i} className="ml-11 mt-1">
                      <SupportToolCard
                        toolName={invocation.toolName}
                        result={invocation.result}
                      />
                    </div>
                  )
                }
                if (invocation.state === 'call') {
                  return (
                    <div key={i} className="ml-11 mt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Looking up data...
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          )
        })}

        {/* Loading indicator */}
        {isLoading &&
          !messages.some(
            (m) =>
              (m as unknown as Record<string, unknown>).toolInvocations &&
              (
                (m as unknown as Record<string, unknown>)
                  .toolInvocations as Array<{ state: string }>
              ).some((t) => t.state === 'call')
          ) && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 flex-shrink-0">
                <Headset className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Looking things up...
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Look up a user, ask about a party..."
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Action Card
// ---------------------------------------------------------------------------

function QuickActionCard({
  action,
  onAction,
}: {
  action: QuickAction
  onAction: (action: QuickAction) => void
}) {
  return (
    <button
      onClick={() => onAction(action)}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left hover:bg-muted transition-colors"
    >
      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-foreground">{action.label}</span>
    </button>
  )
}
