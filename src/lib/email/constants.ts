// =============================================================================
// EMAIL CONSTANTS
// =============================================================================

export const DEFAULT_FROM = 'Tomi <hello@livetomi.com>'

/** Brand colors for email templates */
export const BRAND = {
  primaryGreen: '#2d6a4f',
  primaryGreenLight: '#4a7c6b',
  warmCream: '#f5efe6',
  accentGold: '#c4a35a',
  darkText: '#1a1a1a',
  mutedText: '#6b7280',
  lightBg: '#fafaf8',
  borderColor: '#e5e7eb',
} as const

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://livetomi.com'
