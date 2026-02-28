import { db } from '@/db'
import { emailSequences } from '@/db/schema/email'
import { eq, and, inArray } from 'drizzle-orm'
import type { EmailType, EmailDataMap, CancelCondition } from './types'

/**
 * Schedule an email for future delivery.
 * The cron job picks these up and sends at the scheduled time.
 */
export async function scheduleEmail<T extends EmailType>(opts: {
  type: T
  to: string
  scheduledFor: Date
  data: EmailDataMap[T]
  userId?: string
  leadEmail?: string
  cancelCondition?: CancelCondition
}): Promise<string> {
  const [row] = await db
    .insert(emailSequences)
    .values({
      emailType: opts.type,
      toAddress: opts.to,
      userId: opts.userId ?? null,
      leadEmail: opts.leadEmail ?? null,
      scheduledFor: opts.scheduledFor,
      status: 'scheduled',
      cancelCondition: opts.cancelCondition ?? null,
      templateData: opts.data as Record<string, unknown>,
    })
    .returning({ id: emailSequences.id })

  console.log(
    `[email] Scheduled ${opts.type} to ${opts.to} for ${opts.scheduledFor.toISOString()}`
  )
  return row.id
}

/**
 * Cancel all pending sequences matching the given email types and recipient.
 * Used when the user takes an action that makes the sequence unnecessary.
 */
export async function cancelSequences(opts: {
  toAddress: string
  emailTypes: EmailType[]
}): Promise<number> {
  const result = await db
    .update(emailSequences)
    .set({ status: 'cancelled' })
    .where(
      and(
        eq(emailSequences.toAddress, opts.toAddress),
        eq(emailSequences.status, 'scheduled'),
        inArray(emailSequences.emailType, opts.emailTypes)
      )
    )
    .returning({ id: emailSequences.id })

  if (result.length > 0) {
    console.log(
      `[email] Cancelled ${result.length} sequences for ${opts.toAddress}`
    )
  }
  return result.length
}

/** Helper: returns a Date that is N days from now */
export function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}
