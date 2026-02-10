import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { embedMany, embed } from 'ai'

type EmbeddingProvider = 'openai' | 'google'

/**
 * Get the embedding model based on EMBEDDING_PROVIDER env var.
 * Defaults to OpenAI text-embedding-3-small (1536 dims) for consistency with pgvector column.
 */
function getEmbeddingModel() {
  const provider = (process.env.EMBEDDING_PROVIDER || 'openai') as EmbeddingProvider

  switch (provider) {
    case 'google':
      return google.textEmbeddingModel('text-embedding-004')
    case 'openai':
    default:
      return openai.textEmbeddingModel('text-embedding-3-small')
  }
}

/**
 * Generate embeddings for multiple text chunks.
 * Batches automatically based on provider limits.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return []

  const model = getEmbeddingModel()

  // Process in batches of 96 (safe for all providers)
  const batchSize = 96
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const result = await embedMany({
      model,
      values: batch,
    })
    allEmbeddings.push(...result.embeddings)
  }

  return allEmbeddings
}

/**
 * Generate a single embedding for a query string.
 */
export async function generateQueryEmbedding(
  text: string
): Promise<number[]> {
  const model = getEmbeddingModel()
  const result = await embed({
    model,
    value: text,
  })
  return result.embedding
}
