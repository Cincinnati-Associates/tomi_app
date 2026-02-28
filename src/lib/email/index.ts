// =============================================================================
// EMAIL SYSTEM - Public API
// =============================================================================

export { sendEmail } from './send'
export { scheduleEmail, cancelSequences, daysFromNow } from './sequences'
export { evaluateCancelCondition } from './conditions'
export { DEFAULT_FROM, BRAND, SITE_URL } from './constants'
export type {
  EmailType,
  EmailDataMap,
  SendEmailRequest,
  SendEmailResult,
  CancelCondition,
  CancelConditionType,
} from './types'
