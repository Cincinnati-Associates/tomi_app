import { Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, CtaButton } from './layout'
import { BRAND, SITE_URL } from '../constants'
import type { EmailDataMap } from '../types'

type Props = EmailDataMap['welcome']

export function WelcomeEmail({ fullName }: Props) {
  const displayName = fullName || 'there'
  return (
    <EmailLayout previewText="Welcome to Tomi — let's find your path to homeownership">
      <Text style={heading}>Welcome to Tomi, {displayName}!</Text>

      <Text style={paragraph}>
        You&apos;ve taken the first step toward co-ownership. Tomi helps you
        buy a home with people you trust — splitting costs, sharing equity, and
        building wealth together.
      </Text>

      <Text style={paragraph}>Here&apos;s what to do next:</Text>

      <Text style={listItem}>
        <strong>1.</strong> Start your Journey to understand your readiness
      </Text>
      <Text style={listItem}>
        <strong>2.</strong> Explore your Home Blueprint to clarify what you want
      </Text>
      <Text style={listItem}>
        <strong>3.</strong> Invite a co-buyer when you&apos;re ready
      </Text>

      <CtaButton href={`${SITE_URL}/journey`}>Start Your Journey</CtaButton>

      <Text style={muted}>
        Have questions? Chat with Homi, our AI assistant, anytime from your
        dashboard.
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

const listItem: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: BRAND.darkText,
  margin: '0 0 4px',
  paddingLeft: '8px',
}

const muted: React.CSSProperties = {
  fontSize: '13px',
  color: BRAND.mutedText,
  lineHeight: '20px',
  margin: '16px 0 0',
}
