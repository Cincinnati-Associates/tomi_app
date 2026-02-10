"use client"

import { CheckCircle, ListTodo, FileText, MessageSquare, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolResultCardProps {
  toolName: string
  result: Record<string, unknown>
}

export function ToolResultCard({ toolName, result }: ToolResultCardProps) {
  switch (toolName) {
    case 'createTask':
      return <TaskCreatedCard result={result} />
    case 'updateTaskStatus':
      return <TaskUpdatedCard result={result} />
    case 'listTasks':
      return <TaskListCard result={result} />
    case 'searchDocuments':
      return <DocumentSearchCard result={result} />
    case 'addTaskComment':
      return <CommentAddedCard result={result} />
    default:
      return null
  }
}

function TaskCreatedCard({ result }: { result: Record<string, unknown> }) {
  const task = result.task as Record<string, unknown> | undefined
  if (!task) return null

  return (
    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 my-2">
      <div className="flex items-center gap-2 mb-2">
        <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          Task Created
        </span>
      </div>
      <p className="font-medium text-foreground">{String(task.title)}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span className="capitalize">{String(task.priority)} priority</span>
        {task.dueDate ? <span>Due: {String(task.dueDate)}</span> : null}
      </div>
    </div>
  )
}

function TaskUpdatedCard({ result }: { result: Record<string, unknown> }) {
  const task = result.task as Record<string, unknown> | undefined
  if (!task) return null

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 my-2">
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Task Updated
        </span>
      </div>
      <p className="text-foreground">
        &ldquo;{String(task.title)}&rdquo; &rarr; <span className="capitalize font-medium">{String(task.status)}</span>
      </p>
    </div>
  )
}

function TaskListCard({ result }: { result: Record<string, unknown> }) {
  const tasks = result.tasks as Array<Record<string, unknown>> | undefined
  if (!tasks) return null
  const count = Number(result.count) || 0

  return (
    <div className="rounded-xl border border-border bg-card p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <ListTodo className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {count} task{count !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={String(task.id)}
            className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
          >
            <span className="text-sm text-foreground">{String(task.title)}</span>
            <div className="flex items-center gap-2">
              <PriorityDot priority={String(task.priority)} />
              <span className="text-xs text-muted-foreground capitalize">
                {String(task.status).replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentSearchCard({ result }: { result: Record<string, unknown> }) {
  if (!result.found) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 my-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            No matching documents found
          </span>
        </div>
      </div>
    )
  }

  return null // The AI will use the search results in its response text
}

function CommentAddedCard({ result }: { result: Record<string, unknown> }) {
  const comment = result.comment as Record<string, unknown> | undefined
  if (!comment) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4 my-2">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Note added to &ldquo;{String(comment.taskTitle)}&rdquo;
        </span>
      </div>
    </div>
  )
}

function PriorityDot({ priority }: { priority: string }) {
  return (
    <span
      className={cn(
        'h-2 w-2 rounded-full',
        priority === 'high' && 'bg-red-500',
        priority === 'medium' && 'bg-amber-500',
        priority === 'low' && 'bg-green-500'
      )}
    />
  )
}
