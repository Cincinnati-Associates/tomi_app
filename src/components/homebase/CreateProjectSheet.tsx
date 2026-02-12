"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#6B7280', // gray
]

interface CreateProjectSheetProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateProjectSheet({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectSheetProps) {
  const { activePartyId } = useHomeBase()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !activePartyId) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/homebase/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: activePartyId,
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        }),
      })

      if (res.ok) {
        setName('')
        setDescription('')
        setColor(PRESET_COLORS[0])
        onCreated()
        onClose()
      }
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg">New Project</DrawerTitle>
          <DrawerDescription>
            Group related tasks under a project
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Project name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ADU Build, Insurance Claim"
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project"
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-10 w-10 rounded-full transition-all',
                    color === c
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="pb-8">
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full min-h-[48px]"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full min-h-[48px]"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
