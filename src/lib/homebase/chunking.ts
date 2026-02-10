/**
 * Recursive character text splitter with overlap.
 * Respects paragraph/section boundaries when possible.
 */

export interface TextChunk {
  content: string
  index: number
  tokenCount: number
  metadata: Record<string, unknown>
}

const DEFAULT_CHUNK_SIZE = 2000 // ~500 tokens
const DEFAULT_CHUNK_OVERLAP = 200 // ~50 tokens

// Separators in priority order: double newline (paragraphs), single newline, sentence end, space
const SEPARATORS = ['\n\n', '\n', '. ', ' ']

/**
 * Estimate token count from character count.
 * Rough heuristic: ~4 chars per token for English text.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Split text into chunks with overlap, respecting natural boundaries.
 */
export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  chunkOverlap = DEFAULT_CHUNK_OVERLAP
): TextChunk[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  // If text fits in one chunk, return it directly
  if (trimmed.length <= chunkSize) {
    return [
      {
        content: trimmed,
        index: 0,
        tokenCount: estimateTokens(trimmed),
        metadata: {},
      },
    ]
  }

  const chunks: TextChunk[] = []
  let start = 0

  while (start < trimmed.length) {
    let end = Math.min(start + chunkSize, trimmed.length)

    // If not at the end of text, try to find a natural break point
    if (end < trimmed.length) {
      const segment = trimmed.slice(start, end)
      let bestBreak = -1

      for (const sep of SEPARATORS) {
        const lastIndex = segment.lastIndexOf(sep)
        if (lastIndex > chunkSize * 0.5) {
          // Only break if we're past halfway
          bestBreak = lastIndex + sep.length
          break
        }
      }

      if (bestBreak > 0) {
        end = start + bestBreak
      }
    }

    const chunkContent = trimmed.slice(start, end).trim()
    if (chunkContent) {
      chunks.push({
        content: chunkContent,
        index: chunks.length,
        tokenCount: estimateTokens(chunkContent),
        metadata: {},
      })
    }

    // Move start forward, accounting for overlap
    start = end - chunkOverlap
    if (start >= trimmed.length) break
    // Prevent infinite loop if overlap is larger than remaining text
    if (start <= (chunks.length > 0 ? end - chunkSize : 0)) {
      start = end
    }
  }

  return chunks
}
