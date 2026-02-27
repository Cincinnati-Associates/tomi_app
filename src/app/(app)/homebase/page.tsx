"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { useHotkeyEvent } from '@/hooks/useHotkeyEvent'
import { HOTKEY_EVENTS } from '@/hooks/useHomeBaseHotkeys'
import { PropertySwitcher } from '@/components/homebase/PropertySwitcher'
import { ProjectCard, AddProjectCard, type ProjectCardData } from '@/components/homebase/ProjectCard'
import { CreateProjectSheet } from '@/components/homebase/CreateProjectSheet'
import { DocumentUpload } from '@/components/homebase/DocumentUpload'
import { TaskList } from '@/components/homebase/TaskList'
import { DocumentList } from '@/components/homebase/DocumentList'

export default function HomeBasePage() {
  const router = useRouter()
  const { activePartyId, parties, isLoading, refreshKey, triggerRefresh } = useHomeBase()
  const [projects, setProjects] = useState<ProjectCardData[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)

  // Hotkey: P → open create project sheet
  useHotkeyEvent(HOTKEY_EVENTS.NEW_PROJECT, useCallback(() => {
    setShowCreateProject(true)
  }, []))

  // Hotkey: U → open document upload
  useHotkeyEvent(HOTKEY_EVENTS.UPLOAD_DOCUMENT, useCallback(() => {
    setShowDocumentUpload(true)
  }, []))

  // Hotkey: Escape → close project sheet or upload modal
  useHotkeyEvent(HOTKEY_EVENTS.CLOSE_PANEL, useCallback(() => {
    if (showDocumentUpload) {
      setShowDocumentUpload(false)
    } else if (showCreateProject) {
      setShowCreateProject(false)
    }
  }, [showDocumentUpload, showCreateProject]))

  const activeParty = parties.find((p) => p.id === activePartyId)

  const fetchProjects = useCallback(async (showLoading = false) => {
    if (!activePartyId) return
    if (showLoading) setIsLoadingProjects(true)
    try {
      const res = await fetch(`/api/homebase/projects?partyId=${activePartyId}`)
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setIsLoadingProjects(false)
    }
  }, [activePartyId])

  // Initial load shows loading skeleton; refreshKey changes silently re-fetch
  useEffect(() => {
    fetchProjects(projects.length === 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartyId, refreshKey])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading HomeBase...</div>
      </div>
    )
  }

  if (!activePartyId) {
    return (
      <div className="flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-semibold mb-2">HomeBase Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            HomeBase unlocks after you close on a property with your co-buyers.
            Continue your journey to get there!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      {/* Property header */}
      <div className="px-4 pt-4 pb-2">
        <PropertySwitcher />
        <div className="flex items-center gap-2.5 mt-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {activeParty?.name || 'My Home'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''} active
            </p>
          </div>
        </div>
      </div>

      {/* Projects section */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-semibold">Projects</h2>
        </div>

        {isLoadingProjects ? (
          <div className="px-4">
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[180px] flex-shrink-0 h-[120px] rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/homebase/projects/${project.id}`)}
              />
            ))}
            <AddProjectCard onClick={() => setShowCreateProject(true)} />
          </div>
        )}
      </div>

      {/* All Tasks */}
      <div className="mt-6 px-4">
        <TaskList />
      </div>

      {/* Documents */}
      <div className="mt-6 px-4">
        <DocumentList limit={5} />
      </div>

      {/* Create project sheet */}
      <CreateProjectSheet
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onCreated={() => {
          triggerRefresh()
          fetchProjects()
        }}
      />

      {/* Document upload modal */}
      <DocumentUpload
        isOpen={showDocumentUpload}
        onClose={() => setShowDocumentUpload(false)}
        onUploaded={() => {
          setShowDocumentUpload(false)
          triggerRefresh()
        }}
      />
    </div>
  )
}
