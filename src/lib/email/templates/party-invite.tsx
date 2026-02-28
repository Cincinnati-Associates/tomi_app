import { Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout, CtaButton } from './layout'
import { BRAND } from '../constants'
import type { EmailDataMap } from '../types'

type Props = EmailDataMap['party_invite']

export function PartyInviteEmail({ inviterName, partyName, inviteUrl }: Props) {
  return (
    <EmailLayout previewText={`${inviterName} invited you to join "${partyName}" on Tomi`}>
      <Text style={heading}>You&apos;re invited!</Text>

      <Text style={paragraph}>
        <strong>{inviterName}</strong> invited you to join{' '}
        <strong>&ldquo;{partyName}&rdquo;</strong> on Tomi — a platform that
        helps people buy homes together through co-ownership.
      </Text>

      <Text style={paragraph}>
        Click below to view the invite and join the buying party.
      </Text>

      <CtaButton href={inviteUrl}>Join the Party</CtaButton>

      <Text style={muted}>
        This invite link expires in 7 days. If you weren&apos;t expecting this,
        you can safely ignore this email.
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
