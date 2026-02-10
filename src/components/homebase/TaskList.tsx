"use client"

import { useState, useEffect, useCallback } from 'react'
import { ListTodo, Plus, X } from 'lucide-react'
import { TaskCard, type TaskCardData } from './TaskCard'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TaskListProps {
  limit?: number
}

export function TaskList({ limit }: TaskListProps) {
  const { activePartyId, refreshKey, triggerRefresh } = useHomeBase()
  const [tasks, setTasks] = useState<TaskCardData[]>([])
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const fetchTasks = useCallback(async () => {
    if (!activePartyId) return
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ partyId: activePartyId })
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/api/homebase/tasks?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [activePartyId, filter])

  // Re-fetch when party, filter, or refreshKey changes
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, refreshKey])

  const handleStatusChange = async (taskId: string, status: string) => {
    if (!activePartyId) return

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    )

    try {
      await fetch(`/api/homebase/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId: activePartyId, status }),
      })
    } catch {
      fetchTasks() // Revert on error
    }
  }

  const handleTaskCreated = () => {
    setShowCreateForm(false)
    triggerRefresh()
  }

  const displayed = limit ? tasks.slice(0, limit) : tasks
  const openCount = tasks.filter((t) => t.status !== 'done').length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Tasks</h3>
          {openCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5">
              {openCount} open
            </span>
          )}
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          {showCreateForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showCreateForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {/* Inline create form */}
      {showCreateForm && (
        <CreateTaskForm
          partyId={activePartyId}
          onCreated={handleTaskCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {(['all', 'todo', 'in_progress', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              filter === f
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f === 'todo' ? 'To Do' : 'Done'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading tasks...
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No tasks yet. Create one above or ask Homi!
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
            />
          ))}
          {limit && tasks.length > limit && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{tasks.length - limit} more tasks
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Inline Create Task Form
// =============================================================================

function CreateTaskForm({
  partyId,
  onCreated,
  onCancel,
}: {
  partyId: string | null
  onCreated: () => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !partyId) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/homebase/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || undefined,
        }),
      })

      if (res.ok) {
        onCreated()
      }
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4 space-y-3">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />

      {/* Priority + Due Date row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={!title.trim() || isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
