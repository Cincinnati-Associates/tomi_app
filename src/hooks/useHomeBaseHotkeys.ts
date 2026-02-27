"use client"

import { useEffect } from 'react'
import { useHomiChatContext } from '@/providers/HomiChatProvider'

/**
 * HomeBase keyboard shortcuts for desktop users.
 *
 * N — New task (opens inline create form)
 * P — New project (opens create project sheet)
 * U — Upload document (opens upload modal)
 * H — Toggle Homi chat panel
 * / — Focus Homi chat input (opens panel if closed)
 * 1/2/3/4 — Switch task filter: All / To Do / In Progress / Done
 * Escape — Close the topmost open panel (cascading)
 *
 * All letter/number keys are suppressed when an input, textarea, select,
 * or contentEditable element is focused.
 */

// Custom event names dispatched to window
export const HOTKEY_EVENTS = {
  NEW_TASK: 'homebase:new-task',
  NEW_PROJECT: 'homebase:new-project',
  UPLOAD_DOCUMENT: 'homebase:upload-document',
  TASK_FILTER: 'homebase:task-filter',
  CLOSE_PANEL: 'homebase:close-panel',
} as const

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

export function useHomeBaseHotkeys() {
  const { toggleChat, openChat, isChatOpen } = useHomiChatContext()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Never capture when modifier keys are held (allow browser/OS shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Escape always works, even in inputs
      if (e.key === 'Escape') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent(HOTKEY_EVENTS.CLOSE_PANEL))
        return
      }

      // All other hotkeys are suppressed when typing in an input
      if (isInputFocused()) return

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          window.dispatchEvent(new CustomEvent(HOTKEY_EVENTS.NEW_TASK))
          break
        case 'p':
          e.preventDefault()
          window.dispatchEvent(new CustomEvent(HOTKEY_EVENTS.NEW_PROJECT))
          break
        case 'u':
          e.preventDefault()
          window.dispatchEvent(new CustomEvent(HOTKEY_EVENTS.UPLOAD_DOCUMENT))
          break
        case 'h':
          e.preventDefault()
          toggleChat()
          break
        case '/':
          e.preventDefault()
          if (!isChatOpen) openChat()
          // Focus the chat input after a tick (panel needs to render)
          setTimeout(() => {
            const chatInput = document.querySelector<HTMLTextAreaElement>(
              '[data-homi-chat-input]'
            )
            chatInput?.focus()
          }, 100)
          break
        case '1':
          e.preventDefault()
          window.dispatchEvent(
            new CustomEvent(HOTKEY_EVENTS.TASK_FILTER, { detail: 'all' })
          )
          break
        case '2':
          e.preventDefault()
          window.dispatchEvent(
            new CustomEvent(HOTKEY_EVENTS.TASK_FILTER, { detail: 'todo' })
          )
          break
        case '3':
          e.preventDefault()
          window.dispatchEvent(
            new CustomEvent(HOTKEY_EVENTS.TASK_FILTER, {
              detail: 'in_progress',
            })
          )
          break
        case '4':
          e.preventDefault()
          window.dispatchEvent(
            new CustomEvent(HOTKEY_EVENTS.TASK_FILTER, { detail: 'done' })
          )
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleChat, openChat, isChatOpen])
}
