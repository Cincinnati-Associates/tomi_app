import { Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, CtaButton } from './layout'
import { BRAND, SITE_URL } from '../constants'
import type { EmailDataMap } from '../types'

type Props = EmailDataMap['welcome']

export function WelcomeEmail({ fullName }: Props) {
  const displayName = fullName || 'there'
  return (
    <EmailLayout previewText="Great things are built together — welcome to Tomi">
      <Text style={greeting}>Hey {displayName} from Tomi 👋</Text>

      <Text style={heading}>Great things are built together.</Text>

      <Text style={paragraph}>
        You&apos;re joining a growing movement of people who believe that with
        the right people, incentives, and technology, we can unlock a more
        fulfilled and rewarding life — together.
      </Text>

      <Text style={paragraph}>We&apos;re honored to have you with us.</Text>

      <CtaButton href={`${SITE_URL}/journey`}>Start Your Journey</CtaButton>

      <Text style={muted}>
        Have questions? Chat with Homi, our AI assistant, anytime from your
        dashboard.
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
