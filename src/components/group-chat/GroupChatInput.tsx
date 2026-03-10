'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface GroupChatInputProps {
  input: string
  setInput: (value: string) => void
  onSend: () => void
  onTyping: () => void
  isHomiResponding: boolean
  typingUsers: string[]
  disabled?: boolean
}

export function GroupChatInput({
  input,
  setInput,
  onSend,
  onTyping,
  isHomiResponding,
  typingUsers,
  disabled,
}: GroupChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const insertHomiMention = useCallback(() => {
    const prefix = '@Homi '
    if (!input.startsWith(prefix)) {
      setInput(prefix + input)
    }
    inputRef.current?.focus()
  }, [input, setInput])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
      onTyping()
    },
    [setInput, onTyping]
  )

  return (
    <div className="border-t bg-background px-4 py-3">
      {/* Typing / responding indicators */}
      {(typingUsers.length > 0 || isHomiResponding) && (
        <div className="text-xs text-muted-foreground mb-2 px-1">
          {isHomiResponding
            ? 'Homi is responding...'
            : `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* @Homi button */}
        <button
          type="button"
          onClick={insertHomiMention}
          disabled={disabled}
          className={cn(
            'flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
            'bg-primary/10 text-primary hover:bg-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Ask Homi"
        >
          @Homi
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type a message..."
            rows={1}
            className={cn(
              'w-full resize-none rounded-xl border bg-muted/50 px-4 py-2.5 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
              'placeholder:text-muted-foreground/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'max-h-32 overflow-y-auto'
            )}
            style={{
              height: 'auto',
              minHeight: '40px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`
            }}
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !input.trim()}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
