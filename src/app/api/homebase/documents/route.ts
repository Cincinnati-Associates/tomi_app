import { NextRequest } from 'next/server'
import { db, homeDocuments, homeDocumentChunks } from '@/db'
import { eq, and, desc } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { extractText } from '@/lib/homebase/document-processing'
import { chunkText } from '@/lib/homebase/chunking'
import { generateEmbeddings } from '@/lib/homebase/embedding'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
])

/**
 * GET /api/homebase/documents?partyId=...&category=...
 * List documents for a party.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')
  const category = searchParams.get('category')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const conditions = [eq(homeDocuments.partyId, partyId!)]
  if (category) {
    conditions.push(eq(homeDocuments.category, category as typeof homeDocuments.category.enumValues[number]))
  }

  const docs = await db
    .select()
    .from(homeDocuments)
    .where(and(...conditions))
    .orderBy(desc(homeDocuments.createdAt))

  return Response.json(docs)
}

/**
 * POST /api/homebase/documents
 * Upload a document (multipart file or JSON text entry).
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  // Determine if it's a file upload or text entry
  if (contentType.includes('multipart/form-data')) {
    return handleFileUpload(request)
  } else {
    return handleTextEntry(request)
  }
}

async function handleFileUpload(request: NextRequest) {
  const formData = await request.formData()
  const partyId = formData.get('partyId') as string
  const title = formData.get('title') as string
  const category = (formData.get('category') as string) || 'other'
  const description = formData.get('description') as string | null
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!title) {
    return Response.json({ error: 'Title is required' }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
      { status: 413 }
    )
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return Response.json(
      { error: 'Unsupported file type. Allowed: PDF, TXT, Markdown, CSV, DOCX.' },
      { status: 400 }
    )
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Create document record with 'uploading' status
  const [doc] = await db
    .insert(homeDocuments)
    .values({
      partyId,
      uploadedBy: auth.userId,
      title,
      description,
      category: category as typeof homeDocuments.category.enumValues[number],
      status: 'uploading',
      fileType: file.type,
      fileSize: file.size,
    })
    .returning()

  try {
    // Upload to Supabase Storage
    const supabase = createServiceRoleClient()
    const storagePath = `${partyId}/${doc.id}/${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('home-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    // Update document with file path and status
    await db
      .update(homeDocuments)
      .set({ filePath: storagePath, status: 'processing', updatedAt: new Date() })
      .where(eq(homeDocuments.id, doc.id))

    // Extract text
    const { text, metadata } = await extractText(buffer, file.type)

    if (text) {
      // Chunk the text
      const chunks = chunkText(text)

      if (chunks.length > 0) {
        // Generate embeddings
        const embeddings = await generateEmbeddings(chunks.map((c) => c.content))

        // Store chunks with embeddings
        await db.insert(homeDocumentChunks).values(
          chunks.map((chunk, i) => ({
            documentId: doc.id,
            chunkIndex: chunk.index,
            content: chunk.content,
            embedding: embeddings[i],
            tokenCount: chunk.tokenCount,
            metadata: chunk.metadata,
          }))
        )
      }

      // Update document to ready
      await db
        .update(homeDocuments)
        .set({
          textContent: text,
          metadata: metadata,
          status: 'ready',
          updatedAt: new Date(),
        })
        .where(eq(homeDocuments.id, doc.id))
    } else {
      // No text extracted (e.g., images) — mark as ready without chunks
      await db
        .update(homeDocuments)
        .set({
          metadata: metadata,
          status: 'ready',
          updatedAt: new Date(),
        })
        .where(eq(homeDocuments.id, doc.id))
    }

    // Fetch the updated document to return
    const [updated] = await db
      .select()
      .from(homeDocuments)
      .where(eq(homeDocuments.id, doc.id))

    return Response.json(updated, { status: 201 })
  } catch (error) {
    console.error('Document processing error:', error)
    // Mark document as errored
    await db
      .update(homeDocuments)
      .set({ status: 'error', updatedAt: new Date() })
      .where(eq(homeDocuments.id, doc.id))

    return Response.json(
      { error: 'Document processing failed', documentId: doc.id },
      { status: 500 }
    )
  }
}

async function handleTextEntry(request: NextRequest) {
  const body = await request.json()
  const { partyId, title, textContent, category = 'other', description } = body as {
    partyId: string
    title: string
    textContent: string
    category?: string
    description?: string
  }

  if (!title || !textContent) {
    return Response.json(
      { error: 'Title and textContent are required' },
      { status: 400 }
    )
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Create document record
  const [doc] = await db
    .insert(homeDocuments)
    .values({
      partyId,
      uploadedBy: auth.userId,
      title,
      description,
      category: category as typeof homeDocuments.category.enumValues[number],
      status: 'processing',
      textContent,
      fileType: 'text/plain',
      fileSize: Buffer.byteLength(textContent, 'utf-8'),
    })
    .returning()

  try {
    // Chunk and embed
    const chunks = chunkText(textContent)

    if (chunks.length > 0) {
      const embeddings = await generateEmbeddings(chunks.map((c) => c.content))

      await db.insert(homeDocumentChunks).values(
        chunks.map((chunk, i) => ({
          documentId: doc.id,
          chunkIndex: chunk.index,
          content: chunk.content,
          embedding: embeddings[i],
          tokenCount: chunk.tokenCount,
          metadata: chunk.metadata,
        }))
      )
    }

    // Mark as ready
    await db
      .update(homeDocuments)
      .set({ status: 'ready', updatedAt: new Date() })
      .where(eq(homeDocuments.id, doc.id))

    const [updated] = await db
      .select()
      .from(homeDocuments)
      .where(eq(homeDocuments.id, doc.id))

    return Response.json(updated, { status: 201 })
  } catch (error) {
    console.error('Text entry processing error:', error)
    await db
      .update(homeDocuments)
      .set({ status: 'error', updatedAt: new Date() })
      .where(eq(homeDocuments.id, doc.id))

    return Response.json(
      { error: 'Processing failed', documentId: doc.id },
      { status: 500 }
    )
  }
}
