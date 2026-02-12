"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, MoreHorizontal, Trash2 } from 'lucide-react'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { TaskList } from '@/components/homebase/TaskList'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProjectDetail {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  status: string
  openTaskCount: number
  totalTaskCount: number
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { activePartyId, refreshKey, triggerRefresh } = useHomeBase()

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchProject = useCallback(async () => {
    if (!activePartyId || !projectId) return
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/homebase/projects/${projectId}?partyId=${activePartyId}`
      )
      if (res.ok) {
        const data = await res.json()
        setProject(data)
        setEditName(data.name)
        setEditDescription(data.description || '')
      } else {
        router.replace('/homebase')
      }
    } catch (err) {
      console.error('Failed to fetch project:', err)
    } finally {
      setIsLoading(false)
    }
  }, [activePartyId, projectId, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject, refreshKey])

  const handleSave = async () => {
    if (!activePartyId || !editName.trim()) return
    try {
      const res = await fetch(`/api/homebase/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: activePartyId,
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      })
      if (res.ok) {
        setIsEditing(false)
        fetchProject()
        triggerRefresh()
      }
    } catch (err) {
      console.error('Failed to update project:', err)
    }
  }

  const handleDelete = async () => {
    if (!activePartyId) return
    try {
      await fetch(
        `/api/homebase/projects/${projectId}?partyId=${activePartyId}`,
        { method: 'DELETE' }
      )
      router.replace('/homebase')
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!activePartyId) return
    try {
      await fetch(`/api/homebase/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId: activePartyId, status: newStatus }),
      })
      fetchProject()
      triggerRefresh()
    } catch (err) {
      console.error('Failed to update project status:', err)
    }
  }

  if (isLoading || !project) {
    return (
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const doneCount = project.totalTaskCount - project.openTaskCount
  const progressPercent =
    project.totalTaskCount > 0
      ? Math.round((doneCount / project.totalTaskCount) * 100)
      : 0

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-border bg-card shadow-lg py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setIsEditing(true)
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                  >
                    Edit project
                  </button>
                  {project.status === 'active' && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        handleStatusChange('completed')
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                    >
                      Mark completed
                    </button>
                  )}
                  {project.status === 'completed' && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        handleStatusChange('active')
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                    >
                      Reopen project
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      handleStatusChange('archived')
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                  >
                    Archive
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setShowDeleteConfirm(true)
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project info */}
        {isEditing ? (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2.5">
              <span
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="flex-1 text-xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                placeholder="Project name"
              />
            </div>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..."
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={!editName.trim()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false)
                  setEditName(project.name)
                  setEditDescription(project.description || '')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-xl font-bold text-foreground">
                {project.name}
              </h1>
              {project.status !== 'active' && (
                <span
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full',
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  {project.status === 'completed' ? 'Completed' : 'Archived'}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 ml-[26px]">
                {project.description}
              </p>
            )}

            {/* Progress bar */}
            {project.totalTaskCount > 0 && (
              <div className="mt-4 ml-[26px]">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>
                    {project.openTaskCount > 0
                      ? `${project.openTaskCount} open`
                      : 'All tasks done'}
                  </span>
                  <span>
                    {doneCount} of {project.totalTaskCount} done ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task list scoped to this project */}
      <div className="px-4">
        <TaskList projectId={projectId} hideProjectFilter />
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl border border-red-200 dark:border-red-800 bg-background p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Delete &ldquo;{project.name}&rdquo;?
            </h3>
            <p className="text-sm text-muted-foreground">
              This will permanently delete the project. Tasks in this project will
              become uncategorized (they won&apos;t be deleted).
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="destructive"
                className="flex-1 min-h-[48px]"
                onClick={handleDelete}
              >
                Delete Project
              </Button>
              <Button
                variant="ghost"
                className="flex-1 min-h-[48px]"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
