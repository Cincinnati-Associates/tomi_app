import { db } from '@/db'
import { sql } from 'drizzle-orm'

export interface ChunkWithDocument {
  chunkId: string
  content: string
  chunkIndex: number
  tokenCount: number
  documentId: string
  documentTitle: string
  documentCategory: string
}

/**
 * Search document chunks by vector similarity for a given party.
 * Uses pgvector cosine distance operator (<=>).
 */
export async function searchDocumentChunks(
  partyId: string,
  queryEmbedding: number[],
  limit = 5
): Promise<ChunkWithDocument[]> {
  const embeddingStr = `[${queryEmbedding.join(',')}]`

  const results = await db.execute(sql`
    SELECT
      c.id as chunk_id,
      c.content,
      c.chunk_index,
      c.token_count,
      d.id as document_id,
      d.title as document_title,
      d.category as document_category,
      c.embedding <=> ${embeddingStr}::vector as distance
    FROM home_document_chunks c
    JOIN home_documents d ON d.id = c.document_id
    WHERE d.party_id = ${partyId}
    AND d.status = 'ready'
    AND c.embedding IS NOT NULL
    ORDER BY c.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `)

  return (results as unknown as Array<Record<string, unknown>>).map((row) => ({
    chunkId: row.chunk_id as string,
    content: row.content as string,
    chunkIndex: row.chunk_index as number,
    tokenCount: row.token_count as number,
    documentId: row.document_id as string,
    documentTitle: row.document_title as string,
    documentCategory: row.document_category as string,
  }))
}
