import { NextRequest } from 'next/server'
import { db, homeLabels } from '@/db'
import { eq } from 'drizzle-orm'
import { requirePartyMember } from '@/lib/homebase/auth'

/**
 * DELETE /api/homebase/labels/[id]?partyId=...
 * Delete a label. Removes it from all tasks via CASCADE.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('partyId')

  const auth = await requirePartyMember(partyId)
  if ('error' in auth) return auth.error

  const existing = await db.query.homeLabels.findFirst({
    where: eq(homeLabels.id, params.id),
  })

  if (!existing || existing.partyId !== partyId) {
    return Response.json({ error: 'Label not found' }, { status: 404 })
  }

  await db.delete(homeLabels).where(eq(homeLabels.id, params.id))

  return Response.json({ success: true })
}
