import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { emailSequences } from '@/db/schema/email'
import { eq, and, lte } from 'drizzle-orm'
import { sendEmail } from '@/lib/email/send'
import { evaluateCancelCondition } from '@/lib/email/conditions'
import type { EmailType, CancelCondition } from '@/lib/email/types'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/email-sequences
 *
 * Vercel cron job that runs every 15 minutes.
 * Picks up due scheduled emails, evaluates cancel conditions, and sends.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Fetch up to 50 due sequences
  const dueSequences = await db
    .select()
    .from(emailSequences)
    .where(
      and(
        eq(emailSequences.status, 'scheduled'),
        lte(emailSequences.scheduledFor, now)
      )
    )
    .limit(50)

  if (dueSequences.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let sent = 0
  let cancelled = 0
  let failed = 0

  for (const seq of dueSequences) {
    try {
      // Check cancel condition
      if (seq.cancelCondition) {
        const shouldCancel = await evaluateCancelCondition(
          seq.cancelCondition as CancelCondition
        )
        if (shouldCancel) {
          await db
            .update(emailSequences)
            .set({ status: 'cancelled', updatedAt: now })
            .where(eq(emailSequences.id, seq.id))
          cancelled++
          continue
        }
      }

      // Send the email
      const result = await sendEmail({
        type: seq.emailType as EmailType,
        to: seq.toAddress,
        data: (seq.templateData ?? {}) as never,
        userId: seq.userId ?? undefined,
        leadEmail: seq.leadEmail ?? undefined,
        idempotencyKey: `seq:${seq.id}`,
      })

      await db
        .update(emailSequences)
        .set({
          status: result.success ? 'sent' : 'skipped',
          emailSendId: result.emailSendId ?? null,
          updatedAt: now,
        })
        .where(eq(emailSequences.id, seq.id))

      if (result.success) sent++
      else failed++
    } catch (err) {
      console.error(`[cron] Failed to process sequence ${seq.id}:`, err)
      failed++
    }
  }

  console.log(
    `[cron] Email sequences processed: ${sent} sent, ${cancelled} cancelled, ${failed} failed`
  )
  return NextResponse.json({ processed: dueSequences.length, sent, cancelled, failed })
}
