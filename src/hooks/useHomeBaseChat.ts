"use client"

import { useChat } from 'ai/react'
import { useCallback, useState, useEffect } from 'react'
import { useHomeBase } from '@/providers/HomeBaseProvider'

export interface QuickAction {
  label: string
  message: string
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: 'What tasks are open?', message: 'What tasks are open?' },
  { label: 'Show my documents', message: 'Show me all my documents' },
  { label: 'Upload a document', message: '' }, // Handled by UI (opens upload modal)
  { label: 'Create a task', message: 'I need to create a new task' },
]

const POST_UPLOAD_ACTIONS: QuickAction[] = [
  { label: "What's in this document?", message: "What's in the document I just uploaded?" },
  { label: 'Show my documents', message: 'Show me all my documents' },
  { label: 'What tasks are open?', message: 'What tasks are open?' },
]

export function useHomeBaseChat() {
  const { activePartyId, triggerRefresh } = useHomeBase()
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_ACTIONS)

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
    api: '/api/homebase/chat',
    body: {
      partyId: activePartyId,
    },
    onFinish: () => {
      // Trigger a refresh of task/doc lists after any AI response completes
      // (it may have used tools to create/update tasks)
      triggerRefresh()
    },
  })

  // Reset chat when party changes
  useEffect(() => {
    setMessages([])
    setQuickActions(DEFAULT_ACTIONS)
  }, [activePartyId, setMessages])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!input.trim() || !activePartyId) return
      chatSubmit(e)
    },
    [input, activePartyId, chatSubmit]
  )

  const sendQuickAction = useCallback(
    (action: QuickAction) => {
      if (!action.message || !activePartyId) return
      append({
        role: 'user',
        content: action.message,
      })
    },
    [activePartyId, append]
  )

  const onDocumentUploaded = useCallback(() => {
    setQuickActions(POST_UPLOAD_ACTIONS)
    triggerRefresh()
  }, [triggerRefresh])

  const resetQuickActions = useCallback(() => {
    setQuickActions(DEFAULT_ACTIONS)
  }, [])

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    quickActions,
    sendQuickAction,
    onDocumentUploaded,
    resetQuickActions,
  }
}
