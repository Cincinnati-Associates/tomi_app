"use client"

import { useEffect } from 'react'

/**
 * Subscribe to a custom hotkey event dispatched on `window`.
 * Automatically cleans up on unmount.
 */
export function useHotkeyEvent(
  eventName: string,
  handler: (detail?: unknown) => void
) {
  useEffect(() => {
    function listener(e: Event) {
      handler((e as CustomEvent).detail)
    }
    window.addEventListener(eventName, listener)
    return () => window.removeEventListener(eventName, listener)
  }, [eventName, handler])
}
