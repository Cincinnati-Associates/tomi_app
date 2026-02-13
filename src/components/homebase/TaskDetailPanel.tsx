"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  Circle,
  Clock,
  GitBranch,
  MessageSquare,
  Plus,
  Send,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface SubtaskData {
  id: string
  title: string
  status: string
  priority: string
  sortOrder: number
  createdAt: string
}

interface LabelData {
  id: string
  name: string
  color: string
}

interface ActivityEntry {
  id: string
  actorId: string | null
  actorType: string
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: string
}

interface TaskDetail {
  id: string
  taskNumber: number
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  startDate: string | null
  assignedTo: string | null
  projectId: string | null
  parentTaskId: string | null
  createdBy: string | null
  completedAt: string | null
  completedBy: string | null
  createdAt: string
  comments: Array<{
    id: string
    content: string
    authorId: string | null
    createdAt: string
  }>
  subtasks: SubtaskData[]
  labels: LabelData[]
  activity: ActivityEntry[]
}

interface TaskDetailPanelProps {
  taskId: string | null
  onClose: () => void
  onTaskDeleted?: () => void
}

export function TaskDetailPanel({
  taskId,
  onClose,
  onTaskDeleted,
}: TaskDetailPanelProps) {
  const isMobile = useIsMobile()

  if (!taskId) return null

  if (isMobile) {
    return (
      <Drawer open={!!taskId} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Task Details</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">
            <TaskDetailContent
              taskId={taskId}
              onClose={onClose}
              onTaskDeleted={onTaskDeleted}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: slide-in panel from right
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/10" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        <TaskDetailContent
          taskId={taskId}
          onClose={onClose}
          onTaskDeleted={onTaskDeleted}
        />
      </div>
    </div>
  )
}

// =============================================================================
// Inner Content (shared between mobile drawer and desktop panel)
// =============================================================================

function TaskDetailContent({
  taskId,
  onClose,
  onTaskDeleted,
}: {
  taskId: string
  onClose: () => void
  onTaskDeleted?: () => void
}) {
  const { activePartyId } = useHomeBase()
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)

  // Debounce ref for auto-save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch task details
  useEffect(() => {
    if (!taskId || !activePartyId) return

    async function fetchTask() {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/homebase/tasks/${taskId}?partyId=${activePartyId}`
        )
        if (res.ok) {
          const data = await res.json()
          setTask(data)
        }
      } catch (err) {
        console.error('Failed to fetch task:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [taskId, activePartyId])

  // Auto-save with debounce
  const saveField = useCallback(
    (updates: Record<string, unknown>) => {
      if (!activePartyId || !taskId) return

      // Optimistic update
      setTask((prev) => (prev ? { ...prev, ...updates } : prev))

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

      saveTimerRef.current = setTimeout(async () => {
        setIsSaving(true)
        try {
          await fetch(`/api/homebase/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partyId: activePartyId, ...updates }),
          })
        } catch (err) {
          console.error('Failed to save task:', err)
        } finally {
          setIsSaving(false)
        }
      }, 500)
    },
    [activePartyId, taskId]
  )

  const handleDelete = async () => {
    if (!activePartyId) return
    try {
      await fetch(
        `/api/homebase/tasks/${taskId}?partyId=${activePartyId}`,
        { method: 'DELETE' }
      )
      onTaskDeleted?.()
      onClose()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !activePartyId) return
    setIsAddingComment(true)
    try {
      const res = await fetch(
        `/api/homebase/tasks/${taskId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partyId: activePartyId,
            content: newComment.trim(),
          }),
        }
      )
      if (res.ok) {
        const comment = await res.json()
        setTask((prev) =>
          prev
            ? { ...prev, comments: [...prev.comments, comment] }
            : prev
        )
        setNewComment('')
      }
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setIsAddingComment(false)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !activePartyId) return
    try {
      const res = await fetch('/api/homebase/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: activePartyId,
          title: newSubtaskTitle.trim(),
          parentTaskId: taskId,
          projectId: task?.projectId,
        }),
      })
      if (res.ok) {
        const subtask = await res.json()
        setTask((prev) =>
          prev
            ? { ...prev, subtasks: [...prev.subtasks, subtask] }
            : prev
        )
        setNewSubtaskTitle('')
        setShowSubtaskInput(false)
      }
    } catch (err) {
      console.error('Failed to create subtask:', err)
    }
  }

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    if (!activePartyId) return
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    // Optimistic
    setTask((prev) =>
      prev
        ? {
            ...prev,
            subtasks: prev.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, status: newStatus } : st
            ),
          }
        : prev
    )
    try {
      await fetch(`/api/homebase/tasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId: activePartyId, status: newStatus }),
      })
    } catch (err) {
      console.error('Failed to toggle subtask:', err)
    }
  }

  if (isLoading || !task) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-6">
      {/* Header: Back + task ID + saving indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-xs font-mono text-muted-foreground/60 bg-muted/50 px-2 py-1 rounded-md">
            T-{task.taskNumber}
          </span>
        </div>
        {isSaving && (
          <span className="text-xs text-muted-foreground">Saving...</span>
        )}
      </div>

      {/* Title (editable) */}
      <input
        type="text"
        value={task.title}
        onChange={(e) => saveField({ title: e.target.value })}
        className="w-full text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground"
        placeholder="Task title"
      />

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
                border: `1px solid ${label.color}40`,
              }}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Status
        </label>
        <div className="flex gap-2">
          {[
            { value: 'todo', label: 'To Do', icon: Circle, color: 'text-muted-foreground' },
            { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
            { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-500' },
          ].map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => saveField({ status: value })}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] flex-1',
                task.status === value
                  ? 'bg-primary/10 text-primary border-2 border-primary/30'
                  : 'bg-muted/50 text-muted-foreground border-2 border-transparent hover:bg-muted'
              )}
            >
              <Icon className={cn('h-5 w-5', task.status === value ? 'text-primary' : color)} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Priority
        </label>
        <div className="flex gap-2">
          {[
            { value: 'low', label: 'Low', bg: 'bg-green-100 dark:bg-green-950/50', text: 'text-green-700 dark:text-green-400', border: 'border-green-300 dark:border-green-800' },
            { value: 'medium', label: 'Medium', bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-800' },
            { value: 'high', label: 'High', bg: 'bg-red-100 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-400', border: 'border-red-300 dark:border-red-800' },
          ].map(({ value, label, bg, text, border }) => (
            <button
              key={value}
              onClick={() => saveField({ priority: value })}
              className={cn(
                'px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] flex-1 border-2',
                task.priority === value
                  ? `${bg} ${text} ${border}`
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Due Date
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="date"
              value={task.dueDate || ''}
              onChange={(e) =>
                saveField({ dueDate: e.target.value || null })
              }
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Start Date
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="date"
              value={task.startDate || ''}
              onChange={(e) =>
                saveField({ startDate: e.target.value || null })
              }
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Description
        </label>
        <textarea
          value={task.description || ''}
          onChange={(e) => saveField({ description: e.target.value || null })}
          placeholder="Add details..."
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Subtasks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            Subtasks
            {task.subtasks.length > 0 && (
              <span className="text-xs">
                ({task.subtasks.filter((st) => st.status === 'done').length}/{task.subtasks.length})
              </span>
            )}
          </label>
          <button
            onClick={() => setShowSubtaskInput(!showSubtaskInput)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {task.subtasks.length > 0 && (
          <div className="space-y-1 mb-2">
            {task.subtasks.map((st) => (
              <button
                key={st.id}
                onClick={() => handleToggleSubtask(st.id, st.status)}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {st.status === 'done' ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    st.status === 'done' && 'line-through text-muted-foreground'
                  )}
                >
                  {st.title}
                </span>
              </button>
            ))}
          </div>
        )}

        {showSubtaskInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSubtask()
                }
                if (e.key === 'Escape') {
                  setShowSubtaskInput(false)
                  setNewSubtaskTitle('')
                }
              }}
              autoFocus
              placeholder="Subtask title..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                newSubtaskTitle.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <MessageSquare className="h-4 w-4" />
          Comments ({task.comments.length})
        </label>

        {task.comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {task.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl bg-muted/50 px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAddComment()
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || isAddingComment}
            className={cn(
              'flex items-center justify-center rounded-xl min-h-[48px] min-w-[48px] transition-colors',
              newComment.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      {task.activity && task.activity.length > 0 && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <Tag className="h-4 w-4" />
            Activity
          </label>
          <div className="space-y-2">
            {task.activity.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="flex-shrink-0 mt-0.5">
                  {entry.actorType === 'ai' ? '🤖' : '👤'}
                </span>
                <div>
                  <span>{formatActivityAction(entry)}</span>
                  <span className="ml-1.5 opacity-60">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
        <p>
          Created{' '}
          {new Date(task.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        {task.completedAt && (
          <p>
            Completed{' '}
            {new Date(task.completedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Delete */}
      <div className="pt-2">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete task
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 space-y-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Delete &ldquo;{task.title}&rdquo;?
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              This cannot be undone. All subtasks and comments will also be deleted.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function formatActivityAction(entry: ActivityEntry): string {
  switch (entry.action) {
    case 'created':
      return 'Created this task'
    case 'status_changed':
      return `Changed status from ${entry.oldValue?.replace('_', ' ')} to ${entry.newValue?.replace('_', ' ')}`
    case 'priority_changed':
      return `Changed priority from ${entry.oldValue} to ${entry.newValue}`
    case 'assigned':
      return entry.newValue ? 'Reassigned task' : 'Unassigned task'
    case 'moved_to_project':
      return entry.newValue ? 'Moved to a project' : 'Removed from project'
    case 'commented':
      return 'Added a comment'
    case 'field_changed':
      if (entry.fieldName === 'title') return `Renamed to "${entry.newValue}"`
      if (entry.fieldName === 'description') return 'Updated description'
      if (entry.fieldName === 'due_date') return entry.newValue ? `Set due date to ${entry.newValue}` : 'Cleared due date'
      if (entry.fieldName === 'start_date') return entry.newValue ? `Set start date to ${entry.newValue}` : 'Cleared start date'
      return `Updated ${entry.fieldName?.replace('_', ' ')}`
    default:
      return entry.action.replace('_', ' ')
  }
}
