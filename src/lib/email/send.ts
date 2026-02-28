import { Resend } from 'resend'
import { render } from '@react-email/components'
import { db } from '@/db'
import { emailSends } from '@/db/schema/email'
import { eq } from 'drizzle-orm'
import { DEFAULT_FROM } from './constants'
import { getTemplate } from './templates'
import type { EmailType, SendEmailRequest, SendEmailResult } from './types'

const RESEND_API_KEY = process.env.RESEND_API_KEY

/**
 * Core email send utility.
 *
 * 1. Logs a `pending` row in email_sends (audit trail)
 * 2. Renders the React Email template to HTML
 * 3. Sends via Resend SDK
 * 4. Updates row to `sent` or `failed`
 *
 * If no RESEND_API_KEY, marks as `skipped` (safe for dev).
 */
export async function sendEmail<T extends EmailType>(
  request: SendEmailRequest<T>
): Promise<SendEmailResult> {
  const { type, to, data, userId, leadEmail, idempotencyKey } = request

  // Check idempotency
  if (idempotencyKey) {
    const existing = await db.query.emailSends.findFirst({
      where: eq(emailSends.idempotencyKey, idempotencyKey),
    })
    if (existing && existing.status !== 'failed') {
      return {
        success: existing.status === 'sent',
        emailSendId: existing.id,
        resendId: existing.resendId ?? undefined,
      }
    }
  }

  // Resolve template + subject
  const template = getTemplate(type)
  if (!template) {
    console.error(`[email] No template found for type: ${type}`)
    return { success: false, error: `Unknown email type: ${type}` }
  }

  const subject = template.subject(data as never)

  // Insert pending row
  const [row] = await db
    .insert(emailSends)
    .values({
      emailType: type,
      toAddress: to,
      fromAddress: DEFAULT_FROM,
      subject,
      userId: userId ?? null,
      leadEmail: leadEmail ?? null,
      status: 'pending',
      idempotencyKey: idempotencyKey ?? null,
    })
    .returning({ id: emailSends.id })

  const emailSendId = row.id

  // Skip if no API key (dev)
  if (!RESEND_API_KEY) {
    console.log(`[email] No RESEND_API_KEY — skipping ${type} to ${to}`)
    await db
      .update(emailSends)
      .set({ status: 'skipped' })
      .where(eq(emailSends.id, emailSendId))
    return { success: true, emailSendId }
  }

  try {
    // Render React Email component to HTML
    const html = await render(template.component(data as never))

    // Send via Resend SDK
    const resend = new Resend(RESEND_API_KEY)
    const { data: resendData, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error(`[email] Resend error for ${type} to ${to}:`, error)
      await db
        .update(emailSends)
        .set({
          status: 'failed',
          errorMessage: error.message,
        })
        .where(eq(emailSends.id, emailSendId))
      return { success: false, emailSendId, error: error.message }
    }

    const resendId = resendData?.id ?? null
    await db
      .update(emailSends)
      .set({
        status: 'sent',
        resendId,
        sentAt: new Date(),
      })
      .where(eq(emailSends.id, emailSendId))

    console.log(`[email] Sent ${type} to ${to} (resendId: ${resendId})`)
    return { success: true, emailSendId, resendId: resendId ?? undefined }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[email] Failed to send ${type} to ${to}:`, message)
    await db
      .update(emailSends)
      .set({
        status: 'failed',
        errorMessage: message,
      })
      .where(eq(emailSends.id, emailSendId))
    return { success: false, emailSendId, error: message }
  }
}
