import { NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { db } from '@/db'
import { emailSends } from '@/db/schema/email'
import { sql, gte } from 'drizzle-orm'

/**
 * GET /api/admin/emails/stats
 * Aggregated email stats: counts by type, status breakdown, daily volume
 */
export async function GET() {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Status breakdown (last 30 days)
  const statusBreakdown = await db
    .select({
      status: emailSends.status,
      count: sql<number>`count(*)::int`,
    })
    .from(emailSends)
    .where(gte(emailSends.createdAt, thirtyDaysAgo))
    .groupBy(emailSends.status)

  // By type (last 30 days)
  const byType = await db
    .select({
      emailType: emailSends.emailType,
      count: sql<number>`count(*)::int`,
    })
    .from(emailSends)
    .where(gte(emailSends.createdAt, thirtyDaysAgo))
    .groupBy(emailSends.emailType)

  // Last 7 days total
  const [recent] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailSends)
    .where(gte(emailSends.createdAt, sevenDaysAgo))

  // All-time total
  const [allTime] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailSends)

  // Daily volume (last 30 days)
  const dailyVolume = await db
    .select({
      date: sql<string>`date(created_at)`,
      count: sql<number>`count(*)::int`,
    })
    .from(emailSends)
    .where(gte(emailSends.createdAt, thirtyDaysAgo))
    .groupBy(sql`date(created_at)`)
    .orderBy(sql`date(created_at)`)

  // Compute summary numbers
  const statusMap: Record<string, number> = {}
  for (const row of statusBreakdown) {
    statusMap[row.status] = row.count
  }

  return NextResponse.json({
    last7Days: recent.count,
    last30Days: Object.values(statusMap).reduce((a, b) => a + b, 0),
    allTime: allTime.count,
    sent: statusMap['sent'] || 0,
    failed: statusMap['failed'] || 0,
    skipped: statusMap['skipped'] || 0,
    bounced: statusMap['bounced'] || 0,
    statusBreakdown,
    byType,
    dailyVolume,
  })
}
