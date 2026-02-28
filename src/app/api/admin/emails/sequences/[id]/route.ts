import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { db } from '@/db'
import { emailSequences } from '@/db/schema/email'
import { eq } from 'drizzle-orm'

/**
 * DELETE /api/admin/emails/sequences/:id
 * Manually cancel a scheduled email sequence
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const { id } = params

  const existing = await db.query.emailSequences.findFirst({
    where: eq(emailSequences.id, id),
  })

  if (!existing) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
  }

  if (existing.status !== 'scheduled') {
    return NextResponse.json(
      { error: `Cannot cancel sequence with status: ${existing.status}` },
      { status: 400 }
    )
  }

  await db
    .update(emailSequences)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(emailSequences.id, id))

  return NextResponse.json({ success: true })
}
