import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  date,
  time,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { bookingStatusEnum } from './enums'

// =============================================================================
// EXTERNAL TABLES - RENTALS (n8n-owned)
// READ-ONLY: These tables are managed by n8n pipelines
// Do NOT modify these directly - they should only be updated after n8n changes
// =============================================================================

export const properties = pgTable('properties', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: text('name').notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code'),
  country: text('country').default('US').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .default(sql`utc_now()`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .default(sql`utc_now()`)
    .notNull(),
})

export const units = pgTable(
  'units',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    propertyId: uuid('property_id').notNull(),
    unitCode: text('unit_code').notNull(),
    displayName: text('display_name'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    availableFrom: date('available_from'),
    availableUntil: date('available_until'),
    isRentalUnit: boolean('is_rental_unit').default(true),
    aliases: text('aliases').array(),
  },
  (table) => [
    index('ix_units_property').using('btree', table.propertyId),
    unique('units_property_id_unit_code_key').on(table.propertyId, table.unitCode),
  ]
)

export const listings = pgTable(
  'listings',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    unitId: uuid('unit_id').notNull(),
    platformRoomId: text('platform_room_id').notNull(),
    platformListingUrl: text('platform_listing_url'),
    title: text('title'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
  },
  (table) => [
    index('ix_listings_unit').using('btree', table.unitId),
    index('listings_unit_idx').using('btree', table.unitId),
  ]
)

export const guests = pgTable(
  'guests',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    fullName: text('full_name').notNull(),
    profileCity: text('profile_city'),
    reviewsCount: integer('reviews_count').default(0),
    isIdentityVerified: boolean('is_identity_verified').default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
  },
  (table) => [index('guests_name_idx').using('gin', table.fullName)]
)

export const reservations = pgTable(
  'reservations',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    listingId: uuid('listing_id'),
    guestId: uuid('guest_id'),
    platform: text('platform').default('airbnb').notNull(),
    confirmationCode: text('confirmation_code').notNull(),
    status: bookingStatusEnum('status').notNull(),
    checkinDate: date('checkin_date').notNull(),
    checkinTime: time('checkin_time').default('15:00:00'),
    checkoutDate: date('checkout_date').notNull(),
    checkoutTime: time('checkout_time').default('11:00:00'),
    nights: integer('nights'),
    adults: integer('adults').default(1).notNull(),
    children: integer('children').default(0).notNull(),
    infants: integer('infants').default(0).notNull(),
    pets: integer('pets').default(0).notNull(),
    messageExcerpt: text('message_excerpt'),
    occupancyTaxesCollected: numeric('occupancy_taxes_collected', {
      precision: 12,
      scale: 2,
    }).default('0'),
    currency: text('currency').default('USD').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    content: text('content'),
    metadata: jsonb('metadata').default({}),
    checkinMonth: date('checkin_month'),
    checkoutMonth: date('checkout_month'),
    grossAmount: numeric('gross_amount', { precision: 10, scale: 2 }),
    hostFees: numeric('host_fees', { precision: 10, scale: 2 }),
    netAmount: numeric('net_amount', { precision: 10, scale: 2 }),
  },
  (table) => [
    index('idx_reservations_checkin_date').using('btree', table.checkinDate),
    index('idx_reservations_checkout_date').using('btree', table.checkoutDate),
    index('idx_reservations_confirmation_code').using(
      'btree',
      table.confirmationCode
    ),
    index('idx_reservations_platform').using('btree', table.platform),
    index('ix_reservations_checkin_month').using('btree', table.checkinMonth),
    index('ix_reservations_listing').using('btree', table.listingId),
    index('ix_reservations_status').using('btree', table.status),
    unique('reservations_platform_confirmation_code_key').on(
      table.platform,
      table.confirmationCode
    ),
  ]
)

export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    reservationId: uuid('reservation_id').notNull(),
    expectedPayoutDate: date('expected_payout_date').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    hostServiceFee: numeric('host_service_fee', {
      precision: 12,
      scale: 2,
    }).default('0'),
    currency: text('currency').default('USD').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true, mode: 'string' }),
    payoutRef: text('payout_ref'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    payoutDate: date('payout_date'),
    payoutMonth: date('payout_month'),
    payoutPeriodStart: date('payout_period_start'),
    payoutPeriodEnd: date('payout_period_end'),
  },
  (table) => [
    index('ix_payouts_payout_date').using('btree', table.payoutDate),
    index('ix_payouts_payout_month').using('btree', table.payoutMonth),
    index('ix_payouts_reservation').using('btree', table.reservationId),
    index('payouts_expected_date_idx').using(
      'btree',
      table.expectedPayoutDate
    ),
  ]
)

export const reservationLineItems = pgTable(
  'reservation_line_items',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    reservationId: uuid('reservation_id').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    qty: numeric('qty', { precision: 12, scale: 3 }).default('1').notNull(),
    unitAmount: numeric('unit_amount', { precision: 12, scale: 2 }),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
  },
  (table) => [
    index('line_items_category_idx').using('btree', table.category),
    index('line_items_reservation_idx').using('btree', table.reservationId),
  ]
)

export const messages = pgTable(
  'messages',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    reservationId: uuid('reservation_id'),
    direction: text('direction').notNull(),
    author: text('author').notNull(),
    body: text('body').notNull(),
    postedAt: timestamp('posted_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    sourceUrl: text('source_url'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
  },
  (table) => [
    index('messages_posted_idx').using('btree', table.postedAt),
    index('messages_reservation_idx').using('btree', table.reservationId),
  ]
)

export const emailsRaw = pgTable(
  'emails_raw',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    reservationId: uuid('reservation_id'),
    listingId: uuid('listing_id'),
    subject: text('subject').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }).notNull(),
    fromAddress: text('from_address').notNull(),
    toAddress: text('to_address').notNull(),
    // rawEml: bytea - skipped
    parsed: jsonb('parsed').default({}),
    processed: boolean('processed').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
  },
  (table) => [
    index('emails_processed_idx').using('btree', table.processed),
    index('emails_sent_idx').using('btree', table.sentAt),
  ]
)

export const ownerBlocks = pgTable(
  'owner_blocks',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    unitId: uuid('unit_id'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    reason: text('reason').default('owner_use'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_owner_blocks_dates').using('btree', table.startDate, table.endDate),
    index('idx_owner_blocks_unit_dates').using(
      'btree',
      table.unitId,
      table.startDate,
      table.endDate
    ),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type Property = typeof properties.$inferSelect
export type Unit = typeof units.$inferSelect
export type Listing = typeof listings.$inferSelect
export type Guest = typeof guests.$inferSelect
export type Reservation = typeof reservations.$inferSelect
export type Payout = typeof payouts.$inferSelect
export type ReservationLineItem = typeof reservationLineItems.$inferSelect
export type Message = typeof messages.$inferSelect
export type EmailRaw = typeof emailsRaw.$inferSelect
export type OwnerBlock = typeof ownerBlocks.$inferSelect
