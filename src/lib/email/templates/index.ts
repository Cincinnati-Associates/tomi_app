import * as React from 'react'
import { PartyInviteEmail } from './party-invite'
import { WelcomeEmail } from './welcome'
import { AssessmentResultsEmail } from './assessment-results'
import {
  LeadNurture1Email,
  LeadNurture2Email,
  LeadNurture3Email,
} from './lead-nurture'
import { OnboardingNudgeEmail } from './onboarding-nudge'
import type { EmailType } from '../types'

interface TemplateEntry {
  /** Returns a React element for rendering to HTML */
  component: (data: never) => React.ReactElement
  /** Returns the email subject line given template data */
  subject: (data: never) => string
}

const templates: Record<EmailType, TemplateEntry> = {
  party_invite: {
    component: (data) => React.createElement(PartyInviteEmail, data),
    subject: (data: { inviterName: string; partyName: string }) =>
      `${data.inviterName} invited you to join "${data.partyName}" on Tomi`,
  },
  welcome: {
    component: (data) => React.createElement(WelcomeEmail, data),
    subject: () => 'Welcome to Tomi — your co-ownership journey starts now',
  },
  assessment_results: {
    component: (data) => React.createElement(AssessmentResultsEmail, data),
    subject: (data: { grade: string }) =>
      `Your Co-Ownership Readiness: Grade ${data.grade}`,
  },
  lead_nurture_1: {
    component: () => React.createElement(LeadNurture1Email),
    subject: () => 'What if you didn\'t have to buy a home alone?',
  },
  lead_nurture_2: {
    component: () => React.createElement(LeadNurture2Email),
    subject: () => 'How much home could you afford with a co-buyer?',
  },
  lead_nurture_3: {
    component: () => React.createElement(LeadNurture3Email),
    subject: () => 'People like you are buying homes together',
  },
  onboarding_nudge: {
    component: (data) => React.createElement(OnboardingNudgeEmail, data),
    subject: (data: { fullName: string }) =>
      `${data.fullName || 'Hey'}, your co-ownership journey is waiting`,
  },
}

export function getTemplate(type: EmailType): TemplateEntry | null {
  return templates[type] ?? null
}
