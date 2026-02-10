"use client"

import { Paperclip, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HomeBaseChatInputProps {
  input: string
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e?: React.FormEvent) => void
  onAttach: () => void
  isLoading: boolean
}

export function HomeBaseChatInput({
  input,
  onInputChange,
  onSubmit,
  onAttach,
  isLoading,
}: HomeBaseChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      {/* Attachment button */}
      <button
        type="button"
        onClick={onAttach}
        className="flex-shrink-0 p-3 text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/10"
        aria-label="Upload a document"
      >
        <Paperclip className="h-5 w-5" />
      </button>

      {/* Input */}
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Homi anything..."
          rows={1}
          className={cn(
            'w-full rounded-2xl border border-border bg-background px-4 py-3',
            'text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/30',
            'placeholder:text-muted-foreground/60',
            'min-h-[48px] max-h-[120px]',
          )}
          style={{ fontSize: '16px' }} // Prevent iOS zoom on focus
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={cn(
          'flex-shrink-0 p-3 rounded-xl transition-colors',
          input.trim() && !isLoading
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground'
        )}
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  )
}
