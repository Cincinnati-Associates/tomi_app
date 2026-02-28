import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { db } from '@/db'
import { emailSequences } from '@/db/schema/email'
import { desc, eq, sql } from 'drizzle-orm'

/**
 * GET /api/admin/emails/sequences
 * Pending sequence queue with optional status filter
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'scheduled'
  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '50')))

  const where = eq(emailSequences.status, status as never)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailSequences)
    .where(where)

  const sequences = await db
    .select()
    .from(emailSequences)
    .where(where)
    .orderBy(desc(emailSequences.scheduledFor))
    .limit(limit)
    .offset((page - 1) * limit)

  return NextResponse.json({
    sequences,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  })
}
