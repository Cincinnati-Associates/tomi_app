"use client"

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHomeBase } from '@/providers/HomeBaseProvider'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'ownership_agreement', label: 'Ownership Agreement' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'financial', label: 'Financial' },
  { value: 'tax', label: 'Tax' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
]

interface DocumentUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploaded?: () => void
}

export function DocumentUpload({ isOpen, onClose, onUploaded }: DocumentUploadProps) {
  const { activePartyId } = useHomeBase()
  const [tab, setTab] = useState<'file' | 'text'>('file')
  const [isUploading, setIsUploading] = useState(false)

  // File tab state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileTitle, setFileTitle] = useState('')
  const [fileCategory, setFileCategory] = useState('other')

  // Text tab state
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textCategory, setTextCategory] = useState('other')

  const reset = useCallback(() => {
    setSelectedFile(null)
    setFileTitle('')
    setFileCategory('other')
    setTextTitle('')
    setTextContent('')
    setTextCategory('other')
    setIsUploading(false)
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!fileTitle) {
        setFileTitle(file.name.replace(/\.[^.]+$/, ''))
      }
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !fileTitle || !activePartyId) return
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', fileTitle)
      formData.append('category', fileCategory)
      formData.append('partyId', activePartyId)

      const res = await fetch('/api/homebase/documents', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        handleClose()
        onUploaded?.()
      } else {
        const data = await res.json()
        alert(data.error || 'Upload failed')
      }
    } catch {
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleTextSave = async () => {
    if (!textTitle || !textContent || !activePartyId) return
    setIsUploading(true)

    try {
      const res = await fetch('/api/homebase/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: activePartyId,
          title: textTitle,
          textContent,
          category: textCategory,
        }),
      })

      if (res.ok) {
        handleClose()
        onUploaded?.()
      } else {
        const data = await res.json()
        alert(data.error || 'Save failed')
      }
    } catch {
      alert('Save failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Add Document</h2>
          <button
            onClick={handleClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('file')}
            className={cn(
              'flex-1 py-3 text-sm font-medium text-center transition-colors',
              tab === 'file'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Upload File
          </button>
          <button
            onClick={() => setTab('text')}
            className={cn(
              'flex-1 py-3 text-sm font-medium text-center transition-colors',
              tab === 'text'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Add Text
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {tab === 'file' ? (
            <>
              {/* File picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Tap to choose a file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, images, Word docs (max 20MB)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx,.xlsx"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="e.g., Co-Ownership Agreement"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || !fileTitle || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g., Insurance Policy Notes"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Text content */}
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste or type your content here..."
                  rows={8}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={textCategory}
                  onChange={(e) => setTextCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <Button
                onClick={handleTextSave}
                disabled={!textTitle || !textContent || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
