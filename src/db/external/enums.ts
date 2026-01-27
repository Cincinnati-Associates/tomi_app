import { pgEnum } from 'drizzle-orm/pg-core'

// =============================================================================
// EXTERNAL ENUMS (n8n-owned)
// READ-ONLY: These enums are managed by n8n pipelines
// Do NOT modify these directly - they should only be updated after n8n changes
// =============================================================================

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending_request',
  'confirmed',
  'reminder',
  'canceled',
  'altered',
])
