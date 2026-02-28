import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdminError } from '@/lib/admin/auth-guard'
import { render } from '@react-email/components'
import { getTemplate } from '@/lib/email/templates'
import { sendEmail } from '@/lib/email/send'
import type { EmailType, EmailDataMap } from '@/lib/email/types'

/** Sample data for each template so admins can preview without real data */
const SAMPLE_DATA: EmailDataMap = {
  party_invite: {
    inviterName: 'Jane Smith',
    partyName: 'The Dream Team',
    inviteUrl: 'https://livetomi.com/invite/sample-token-123',
  },
  welcome: {
    fullName: 'Alex Johnson',
  },
  assessment_results: {
    email: 'test@example.com',
    grade: 'B',
    score: 27,
    strengths: ['Strong financial awareness', 'Clear co-buyer criteria', 'Realistic timeline expectations'],
    growthAreas: ['Legal structure knowledge', 'Exit strategy planning'],
  },
  lead_nurture_1: { email: 'test@example.com' },
  lead_nurture_2: { email: 'test@example.com' },
  lead_nurture_3: { email: 'test@example.com' },
  onboarding_nudge: { fullName: 'Alex Johnson' },
}

const ALL_TYPES: EmailType[] = [
  'party_invite',
  'welcome',
  'assessment_results',
  'lead_nurture_1',
  'lead_nurture_2',
  'lead_nurture_3',
  'onboarding_nudge',
]

/**
 * POST /api/admin/emails/preview
 *
 * Body: { type: EmailType, sendTo?: string }
 * - Without sendTo: returns rendered HTML for preview
 * - With sendTo: renders + sends a real test email to that address
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const body = await request.json()
  const type = body.type as EmailType
  const sendTo = body.sendTo as string | undefined

  if (!type || !ALL_TYPES.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid email type', validTypes: ALL_TYPES },
      { status: 400 }
    )
  }

  const template = getTemplate(type)
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const data = SAMPLE_DATA[type]
  const subject = template.subject(data as never)
  const html = await render(template.component(data as never))

  // Preview only
  if (!sendTo) {
    return NextResponse.json({ html, subject, type })
  }

  // Send a real test email
  const result = await sendEmail({
    type,
    to: sendTo,
    data: data as never,
    userId: auth.userId,
    idempotencyKey: `test:${type}:${auth.userId}:${Date.now()}`,
  })

  return NextResponse.json({
    html,
    subject,
    type,
    sent: result.success,
    error: result.error,
    emailSendId: result.emailSendId,
  })
}

/**
 * GET /api/admin/emails/preview
 * Returns the list of available template types with their sample subjects.
 */
export async function GET() {
  const auth = await requireAdmin()
  if (isAdminError(auth)) return auth

  const types = ALL_TYPES.map((type) => {
    const template = getTemplate(type)
    const data = SAMPLE_DATA[type]
    return {
      type,
      label: type.replace(/_/g, ' '),
      subject: template?.subject(data as never) ?? '',
    }
  })

  return NextResponse.json({ types })
}
