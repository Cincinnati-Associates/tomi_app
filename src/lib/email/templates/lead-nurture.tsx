import { Text, Link } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, CtaButton } from './layout'
import { BRAND, SITE_URL } from '../constants'

// =============================================================================
// Lead Nurture 1 — Day 3: The co-ownership concept
// =============================================================================

export function LeadNurture1Email() {
  return (
    <EmailLayout previewText="What if you didn't have to buy a home alone?">
      <Text style={heading}>What if you didn&apos;t have to buy a home alone?</Text>

      <Text style={paragraph}>
        Most people think homeownership is an all-or-nothing deal — you either
        qualify on your own or you rent forever. But that&apos;s not true.
      </Text>

      <Text style={paragraph}>
        <strong>Co-ownership</strong> (tenants-in-common) lets you buy a home
        with people you trust. Each person owns a defined share, contributes
        their portion, and builds real equity.
      </Text>

      <Text style={paragraph}>
        It&apos;s not a new idea — families have done this for generations. Tomi
        just makes it structured, legal, and fair.
      </Text>

      <CtaButton href={`${SITE_URL}/how-it-works`}>
        See How It Works
      </CtaButton>

      <Text style={muted}>
        You received this because you took an assessment on{' '}
        <Link href={SITE_URL} style={mutedLink}>livetomi.com</Link>.
      </Text>
    </EmailLayout>
  )
}

// =============================================================================
// Lead Nurture 2 — Day 7: Affordability angle
// =============================================================================

export function LeadNurture2Email() {
  return (
    <EmailLayout previewText="How much home could you afford with a co-buyer?">
      <Text style={heading}>How much home could you afford with a co-buyer?</Text>

      <Text style={paragraph}>
        Splitting costs with a co-buyer doesn&apos;t just make homeownership
        possible — it makes it <strong>better</strong>. More buying power, lower
        monthly payments, and shared maintenance.
      </Text>

      <Text style={paragraph}>
        Try our free calculator to see what you could afford with 2, 3, or 4
        co-owners.
      </Text>

      <CtaButton href={`${SITE_URL}/calculator`}>
        Try the Calculator
      </CtaButton>

      <Text style={muted}>
        You received this because you took an assessment on{' '}
        <Link href={SITE_URL} style={mutedLink}>livetomi.com</Link>.
      </Text>
    </EmailLayout>
  )
}

// =============================================================================
// Lead Nurture 3 — Day 14: Social proof + sign up
// =============================================================================

export function LeadNurture3Email() {
  return (
    <EmailLayout previewText="People like you are buying homes together">
      <Text style={heading}>People like you are buying homes together</Text>

      <Text style={paragraph}>
        Friends, siblings, coworkers — people across the country are forming
        co-buying groups to break into homeownership sooner than they thought
        possible.
      </Text>

      <Text style={paragraph}>
        Tomi guides you through the entire process: assessing readiness, forming
        a group, understanding legal structures, and finding the right property.
      </Text>

      <Text style={paragraph}>
        Create a free account to start your personalized co-ownership journey.
      </Text>

      <CtaButton href={`${SITE_URL}/auth/register`}>
        Get Started — It&apos;s Free
      </CtaButton>

      <Text style={muted}>
        You received this because you took an assessment on{' '}
        <Link href={SITE_URL} style={mutedLink}>livetomi.com</Link>.
        This is the last email in this series.
      </Text>
    </EmailLayout>
  )
}

// Shared styles
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

const mutedLink: React.CSSProperties = {
  color: BRAND.mutedText,
  textDecoration: 'underline',
}
