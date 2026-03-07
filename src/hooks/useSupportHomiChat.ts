"use client"

import { useChat } from 'ai/react'
import { useCallback } from 'react'

export interface QuickAction {
  label: string
  message: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Look up a user',
    message: 'I need to look up a user. What name or email should I search for?',
  },
  {
    label: 'Show recent signups',
    message:
      'Who are our most recent signups? Look up users who joined recently.',
  },
  {
    label: 'Users needing attention',
    message:
      'Are there any users who might need attention? Look for users who signed up but haven\'t made progress.',
  },
]

export function useSupportHomiChat() {
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit: chatSubmit,
    isLoading,
    append,
    setMessages,
  } = useChat({
    api: '/api/admin/support/chat',
    maxSteps: 5,
    keepLastMessageOnError: true,
    onError: (error) => {
      console.error('Support Homi chat error:', error)
    },
  })

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!input.trim()) return
      chatSubmit(e)
    },
    [input, chatSubmit]
  )

  const sendQuickAction = useCallback(
    (action: QuickAction) => {
      if (!action.message) return
      append({
        role: 'user',
        content: action.message,
      })
    },
    [append]
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [setMessages])

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    clearChat,
    quickActions: QUICK_ACTIONS,
    sendQuickAction,
  }
}
