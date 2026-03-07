import { Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, CtaButton } from './layout'
import { BRAND, SITE_URL } from '../constants'
import type { EmailDataMap } from '../types'

type Props = EmailDataMap['welcome']

export function WelcomeEmail({ fullName }: Props) {
  const displayName = fullName || 'there'
  return (
    <EmailLayout previewText="Your co-buying journey starts now — welcome to Tomi">
      <Text style={greeting}>Hey {displayName} from Tomi 👋</Text>

      <Text style={heading}>Your path to homeownership just got clearer.</Text>

      <Text style={paragraph}>
        Most people think buying a home alone is the only option. Tomi shows
        you a smarter way — buy together, build wealth together, and actually
        afford the home you want.
      </Text>

      <Text style={paragraph}>
        Your personalized journey is ready. In just a few minutes, you&apos;ll
        discover your co-buying style, see what you can actually afford, and
        get a step-by-step plan tailored to your goals.
      </Text>

      <CtaButton href={`${SITE_URL}/journey`}>Start Your Journey</CtaButton>

      <Text style={muted}>
        Have questions along the way? Homi, your AI co-buying guide, is
        available anytime from your dashboard.
      </Text>
    </EmailLayout>
  )
}

const greeting: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: BRAND.darkText,
  margin: '0 0 8px',
}

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: BRAND.primaryGreen,
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
