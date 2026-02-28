import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { db } from '@/db'
import { emailSends } from '@/db/schema/email'
import { desc, eq, and, gte, lte, like, sql } from 'drizzle-orm'

/**
 * GET /api/admin/emails
 * Paginated send log with filters: type, status, to, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '50')))
  const typeFilter = searchParams.get('type') || ''
  const statusFilter = searchParams.get('status') || ''
  const toFilter = searchParams.get('to') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  // Build where conditions
  const conditions = []
  if (typeFilter) conditions.push(eq(emailSends.emailType, typeFilter))
  if (statusFilter) conditions.push(eq(emailSends.status, statusFilter as never))
  if (toFilter) conditions.push(like(emailSends.toAddress, `%${toFilter}%`))
  if (dateFrom) conditions.push(gte(emailSends.createdAt, new Date(dateFrom)))
  if (dateTo) conditions.push(lte(emailSends.createdAt, new Date(dateTo)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailSends)
    .where(where)

  // Fetch page
  const sends = await db
    .select()
    .from(emailSends)
    .where(where)
    .orderBy(desc(emailSends.createdAt))
    .limit(limit)
    .offset((page - 1) * limit)

  return NextResponse.json({
    sends,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  })
}
