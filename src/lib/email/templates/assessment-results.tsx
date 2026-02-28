import { Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, CtaButton } from './layout'
import { BRAND, SITE_URL } from '../constants'
import type { EmailDataMap } from '../types'

type Props = EmailDataMap['assessment_results']

const gradeLabels: Record<string, string> = {
  A: 'Highly Ready',
  B: 'On Track',
  C: 'Getting There',
  D: 'Just Starting',
}

export function AssessmentResultsEmail({
  grade,
  score,
  strengths,
  growthAreas,
}: Props) {
  const label = gradeLabels[grade] || grade
  return (
    <EmailLayout previewText={`Your co-ownership readiness: Grade ${grade} — ${label}`}>
      <Text style={heading}>Your Co-Ownership Readiness Results</Text>

      <Text style={gradeDisplay}>
        Grade {grade} — {label}
      </Text>

      <Text style={scoreText}>Score: {score}/36</Text>

      {strengths.length > 0 && (
        <>
          <Text style={sectionLabel}>Your Strengths</Text>
          {strengths.map((s, i) => (
            <Text key={i} style={bulletItem}>
              {s}
            </Text>
          ))}
        </>
      )}

      {growthAreas.length > 0 && (
        <>
          <Text style={sectionLabel}>Areas to Explore</Text>
          {growthAreas.map((g, i) => (
            <Text key={i} style={bulletItem}>
              {g}
            </Text>
          ))}
        </>
      )}

      <Text style={paragraph}>
        Ready to take the next step? Create a free account to access your
        personalized co-ownership journey.
      </Text>

      <CtaButton href={`${SITE_URL}/auth/register`}>
        Create Your Free Account
      </CtaButton>

      <Text style={muted}>
        This assessment was taken on livetomi.com. If you didn&apos;t take this
        assessment, you can ignore this email.
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

const gradeDisplay: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: BRAND.primaryGreen,
  margin: '0 0 4px',
}

const scoreText: React.CSSProperties = {
  fontSize: '14px',
  color: BRAND.mutedText,
  margin: '0 0 20px',
}

const sectionLabel: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: BRAND.darkText,
  margin: '16px 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const bulletItem: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '22px',
  color: BRAND.darkText,
  margin: '0 0 4px',
  paddingLeft: '12px',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: BRAND.darkText,
  margin: '20px 0 12px',
}

const muted: React.CSSProperties = {
  fontSize: '13px',
  color: BRAND.mutedText,
  lineHeight: '20px',
  margin: '16px 0 0',
}
