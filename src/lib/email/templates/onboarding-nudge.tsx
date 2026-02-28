import { Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, CtaButton } from './layout'
import { BRAND, SITE_URL } from '../constants'
import type { EmailDataMap } from '../types'

type Props = EmailDataMap['onboarding_nudge']

export function OnboardingNudgeEmail({ fullName }: Props) {
  const displayName = fullName || 'there'
  return (
    <EmailLayout previewText={`${displayName}, your co-ownership journey is waiting`}>
      <Text style={heading}>
        Ready to pick up where you left off, {displayName}?
      </Text>

      <Text style={paragraph}>
        You created your Tomi account a few days ago — nice! But you
        haven&apos;t started your journey yet.
      </Text>

      <Text style={paragraph}>
        Your Journey is a step-by-step guide to co-ownership readiness. It takes
        about 10 minutes to get started and helps you understand what kind of
        co-buyer you are.
      </Text>

      <CtaButton href={`${SITE_URL}/journey`}>
        Start Your Journey
      </CtaButton>

      <Text style={muted}>
        Already started? Great — just ignore this email!
      </Text>
    </EmailLayout>
  )
}

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: BRAND.darkText,
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: BRAND.darkText,
  margin: '0 0 12px',
}

const muted: React.CSSProperties = {
  fontSize: '13px',
  color: BRAND.mutedText,
  lineHeight: '20px',
  margin: '16px 0 0',
}
