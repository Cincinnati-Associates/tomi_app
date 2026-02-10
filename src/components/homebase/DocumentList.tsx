"use client"

import { useState, useEffect, useCallback } from 'react'
import { FileText } from 'lucide-react'
import { DocumentCard, type DocumentCardData } from './DocumentCard'
import { useHomeBase } from '@/providers/HomeBaseProvider'

interface DocumentListProps {
  limit?: number
}

export function DocumentList({ limit }: DocumentListProps) {
  const { activePartyId, refreshKey } = useHomeBase()
  const [documents, setDocuments] = useState<DocumentCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    if (!activePartyId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/homebase/documents?partyId=${activePartyId}`)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setIsLoading(false)
    }
  }, [activePartyId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments, refreshKey])

  const handleDelete = async (id: string) => {
    if (!activePartyId) return
    if (!confirm('Delete this document? This cannot be undone.')) return

    setDocuments((prev) => prev.filter((d) => d.id !== id))
    try {
      await fetch(`/api/homebase/documents/${id}?partyId=${activePartyId}`, {
        method: 'DELETE',
      })
    } catch {
      fetchDocuments()
    }
  }

  const displayed = limit ? documents.slice(0, limit) : documents

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Documents</h3>
        {documents.length > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5">
            {documents.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading documents...
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No documents yet. Upload one or ask Homi!
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDelete}
            />
          ))}
          {limit && documents.length > limit && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{documents.length - limit} more documents
            </p>
          )}
        </div>
      )}
    </div>
  )
}
