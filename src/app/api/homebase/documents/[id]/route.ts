import { NextRequest } from 'next/server'
import { db, homeDocuments, homeDocumentChunks } from '@/db'
import { eq } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'
import { createServiceRoleClient } from '@/lib/supabase-server'

/**
 * GET /api/homebase/documents/[id]?partyId=...
 * Get a single document.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const doc = await db.query.homeDocuments.findFirst({
    where: eq(homeDocuments.id, params.id),
  })

  if (!doc || doc.partyId !== partyId) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }

  return Response.json(doc)
}

/**
 * DELETE /api/homebase/documents/[id]?partyId=...
 * Delete a document, its chunks, and the storage file.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Fetch document to get file path
  const doc = await db.query.homeDocuments.findFirst({
    where: eq(homeDocuments.id, params.id),
  })

  if (!doc || doc.partyId !== partyId) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }

  // Delete from Supabase Storage if there's a file
  if (doc.filePath) {
    const supabase = createServiceRoleClient()
    await supabase.storage.from('home-documents').remove([doc.filePath])
  }

  // Delete chunks (cascade) and document
  await db.delete(homeDocumentChunks).where(eq(homeDocumentChunks.documentId, params.id))
  await db.delete(homeDocuments).where(eq(homeDocuments.id, params.id))

  return Response.json({ success: true })
}
