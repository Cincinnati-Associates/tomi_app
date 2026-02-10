"use client"

import { useState } from 'react'
import { Home, ChevronDown, Users } from 'lucide-react'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { cn } from '@/lib/utils'

export function PropertySwitcher() {
  const { parties, activePartyId, setActivePartyId } = useHomeBase()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show if only one property
  if (parties.length <= 1) return null

  const activeParty = parties.find((p) => p.id === activePartyId)

  return (
    <div className="relative border-b border-border bg-card/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {activeParty?.name || 'Select property'}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-40 border-b border-border bg-card shadow-lg">
          {parties.map((party) => (
            <button
              key={party.id}
              onClick={() => {
                setActivePartyId(party.id)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors',
                party.id === activePartyId && 'bg-primary/5'
              )}
            >
              <Home
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  party.id === activePartyId
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{party.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {party.members.join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
