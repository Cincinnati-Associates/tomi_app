/**
 * Extract text content from a file buffer based on MIME type.
 * For MVP: PDF text extraction and plain text. Images skip extraction.
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; metadata: Record<string, unknown> }> {
  if (mimeType === 'application/pdf') {
    return extractPdfText(buffer)
  }

  if (mimeType === 'text/plain') {
    return {
      text: buffer.toString('utf-8'),
      metadata: { charCount: buffer.length },
    }
  }

  // Images and other types: no extraction for MVP
  // Users can add manual text entries alongside these
  return {
    text: '',
    metadata: { note: 'Text extraction not available for this file type' },
  }
}

async function extractPdfText(
  buffer: Buffer
): Promise<{ text: string; metadata: Record<string, unknown> }> {
  // Dynamic import for pdf-parse (uses export = pattern)
  const mod = await import('pdf-parse')
  const pdfParse = (mod as unknown as { default: (buf: Buffer) => Promise<{ text: string; numpages: number; info: unknown }> }).default || mod

  const result = await pdfParse(buffer)

  return {
    text: result.text,
    metadata: {
      pageCount: result.numpages,
      info: result.info,
    },
  }
}
