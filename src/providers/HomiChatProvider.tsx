"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useChat, type Message } from 'ai/react'
import { usePathname } from 'next/navigation'

export interface QuickAction {
  label: string
  message: string
}

interface HomiChatContextType {
  /** Whether the chat panel is open/visible */
  isChatOpen: boolean
  /** Open the chat panel */
  openChat: () => void
  /** Close the chat panel */
  closeChat: () => void
  /** Toggle the chat panel */
  toggleChat: () => void
  /** Chat messages */
  messages: Message[]
  /** Current input value */
  input: string
  /** Set the input value */
  setInput: (value: string) => void
  /** Handle input change from textarea */
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** Submit the current input */
  handleSubmit: (e?: React.FormEvent) => void
  /** Send a specific message */
  sendMessage: (content: string) => void
  /** Whether the AI is generating a response */
  isLoading: boolean
  /** Quick action suggestions */
  quickActions: QuickAction[]
  /** Programmatic scroll to chat panel (for swipe shell) */
  scrollToChatRef: React.MutableRefObject<(() => void) | null>
  /** Callback for when AI tool calls modify data (tasks, etc.) */
  onToolCallRefresh: React.MutableRefObject<(() => void) | null>
}

const HomiChatContext = createContext<HomiChatContextType | null>(null)

const HOMEBASE_ACTIONS: QuickAction[] = [
  { label: 'What needs attention?', message: 'What tasks need attention? Any overdue or high priority?' },
  { label: 'Show my projects', message: 'Show me all my projects' },
  { label: 'Create a task', message: 'I need to create a new task' },
]

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: 'How does co-ownership work?', message: 'How does co-ownership work?' },
  { label: 'Help me get started', message: 'Help me get started with my homebuying journey' },
]

export function HomiChatProvider({
  children,
  partyId,
}: {
  children: ReactNode
  partyId?: string | null
}) {
  const pathname = usePathname()
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Refs for shell integration
  const scrollToChatRef = useRef<(() => void) | null>(null)
  const onToolCallRefresh = useRef<(() => void) | null>(null)

  // Determine which chat endpoint to use based on current route
  const isHomeBase = pathname?.startsWith('/homebase')
  const chatApi = isHomeBase && partyId ? '/api/homebase/chat' : '/api/chat'

  // Build request body based on context
  const body = isHomeBase && partyId ? { partyId } : undefined

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit: chatSubmit,
    isLoading,
    append,
  } = useChat({
    api: chatApi,
    body,
    onFinish: () => {
      // Trigger refresh of task/doc lists when AI might have used tools
      onToolCallRefresh.current?.()
    },
  })

  const openChat = useCallback(() => {
    setIsChatOpen(true)
    scrollToChatRef.current?.()
  }, [])

  const closeChat = useCallback(() => {
    setIsChatOpen(false)
  }, [])

  const toggleChat = useCallback(() => {
    if (isChatOpen) {
      closeChat()
    } else {
      openChat()
    }
  }, [isChatOpen, openChat, closeChat])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!input.trim()) return
      chatSubmit(e)
    },
    [input, chatSubmit]
  )

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return
      append({ role: 'user', content: content.trim() })
    },
    [append]
  )

  const quickActions = isHomeBase ? HOMEBASE_ACTIONS : DEFAULT_ACTIONS

  return (
    <HomiChatContext.Provider
      value={{
        isChatOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        sendMessage,
        isLoading,
        quickActions,
        scrollToChatRef,
        onToolCallRefresh,
      }}
    >
      {children}
    </HomiChatContext.Provider>
  )
}

export function useHomiChatContext() {
  const context = useContext(HomiChatContext)
  if (!context) {
    throw new Error('useHomiChatContext must be used within a HomiChatProvider')
  }
  return context
}
