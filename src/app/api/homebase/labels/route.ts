import { NextRequest } from 'next/server'
import { db, homeLabels } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'

/**
 * GET /api/homebase/labels?partyId=...
 * List all labels for a party.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const labels = await db.query.homeLabels.findMany({
    where: eq(homeLabels.partyId, partyId!),
    orderBy: (labels, { asc }) => [asc(labels.name)],
  })

  return Response.json(labels)
}

/**
 * POST /api/homebase/labels
 * Create a label.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { partyId, name, color } = body as {
    partyId: string
    name: string
    color?: string
  }

  if (!name?.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  // Check for duplicate (case-insensitive)
  const existing = await db.query.homeLabels.findFirst({
    where: sql`${homeLabels.partyId} = ${partyId} AND lower(${homeLabels.name}) = lower(${name.trim()})`,
  })

  if (existing) {
    return Response.json(existing) // Return existing label instead of error
  }

  const [label] = await db
    .insert(homeLabels)
    .values({
      partyId,
      name: name.trim(),
      color: color || '#6B7280',
    })
    .returning()

  return Response.json(label, { status: 201 })
}
