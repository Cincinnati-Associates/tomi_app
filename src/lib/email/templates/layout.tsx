import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Img,
  Link,
} from '@react-email/components'
import * as React from 'react'
import { BRAND, SITE_URL } from '../constants'

interface EmailLayoutProps {
  children: React.ReactNode
  previewText?: string
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {previewText && (
        <span
          style={{
            display: 'none',
            overflow: 'hidden',
            lineHeight: '1px',
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
          }}
        >
          {previewText}
        </span>
      )}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={SITE_URL} style={{ textDecoration: 'none' }}>
              <Img
                src={`${SITE_URL}/logo-dark.png`}
                alt="Tomi"
                height="28"
                style={{ margin: '0 auto' }}
              />
            </Link>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Tomi helps people buy homes together through co-ownership.
            </Text>
            <Text style={footerText}>
              <Link href={`${SITE_URL}`} style={footerLink}>
                livetomi.com
              </Link>
              {' | '}
              <Link href={`${SITE_URL}/privacy`} style={footerLink}>
                Privacy
              </Link>
            </Text>
            <Text style={footerMuted}>
              Cincinnati Associates LLC, Cincinnati, OH
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

/** CTA button reusable across templates */
export function CtaButton({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <table
      role="presentation"
      cellPadding="0"
      cellSpacing="0"
      style={{ margin: '24px auto' }}
    >
      <tbody>
        <tr>
          <td style={ctaCell}>
            <Link href={href} style={ctaLink}>
              {children}
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// Styles
const body: React.CSSProperties = {
  backgroundColor: BRAND.lightBg,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 20px',
}

const header: React.CSSProperties = {
  textAlign: 'center' as const,
  paddingBottom: '24px',
}

const content: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px 28px',
  border: `1px solid ${BRAND.borderColor}`,
}

const hr: React.CSSProperties = {
  borderColor: BRAND.borderColor,
  margin: '24px 0',
}

const footer: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '0 20px',
}

const footerText: React.CSSProperties = {
  fontSize: '13px',
  color: BRAND.mutedText,
  lineHeight: '20px',
  margin: '4px 0',
}

const footerLink: React.CSSProperties = {
  color: BRAND.primaryGreen,
  textDecoration: 'underline',
}

const footerMuted: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '8px 0 0',
}

const ctaCell: React.CSSProperties = {
  backgroundColor: BRAND.primaryGreen,
  borderRadius: '8px',
  padding: '0',
}

const ctaLink: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 32px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'none',
  textAlign: 'center' as const,
}
