import { relations } from 'drizzle-orm'
import {
  properties,
  units,
  listings,
  guests,
  reservations,
  payouts,
  reservationLineItems,
  messages,
  emailsRaw,
  ownerBlocks,
} from './rentals'
import {
  chartOfAccounts,
  sourceDocuments,
  financialTransactions,
  transactionAllocations,
  vendorMappings,
  merchantCategoryRules,
} from './financial'
import { aiDocuments, aiChunks } from './ai'
import { expenseReviewQueue, expenseReviewState } from './operations'

// =============================================================================
// EXTERNAL RELATIONS (n8n-owned tables)
// READ-ONLY: These relations define how n8n-owned tables relate to each other
// =============================================================================

// Properties & Units
export const propertiesRelations = relations(properties, ({ many }) => ({
  units: many(units),
  transactionAllocations: many(transactionAllocations),
}))

export const unitsRelations = relations(units, ({ one, many }) => ({
  property: one(properties, {
    fields: [units.propertyId],
    references: [properties.id],
  }),
  listings: many(listings),
  transactionAllocations: many(transactionAllocations),
  ownerBlocks: many(ownerBlocks),
}))

export const listingsRelations = relations(listings, ({ one, many }) => ({
  unit: one(units, {
    fields: [listings.unitId],
    references: [units.id],
  }),
  reservations: many(reservations),
  emailsRaw: many(emailsRaw),
}))

// Reservations & Related
export const guestsRelations = relations(guests, ({ many }) => ({
  reservations: many(reservations),
}))

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  listing: one(listings, {
    fields: [reservations.listingId],
    references: [listings.id],
  }),
  guest: one(guests, {
    fields: [reservations.guestId],
    references: [guests.id],
  }),
  payouts: many(payouts),
  lineItems: many(reservationLineItems),
  messages: many(messages),
  emailsRaw: many(emailsRaw),
  financialTransactions: many(financialTransactions),
}))

export const payoutsRelations = relations(payouts, ({ one }) => ({
  reservation: one(reservations, {
    fields: [payouts.reservationId],
    references: [reservations.id],
  }),
}))

export const reservationLineItemsRelations = relations(
  reservationLineItems,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationLineItems.reservationId],
      references: [reservations.id],
    }),
  })
)

export const messagesRelations = relations(messages, ({ one }) => ({
  reservation: one(reservations, {
    fields: [messages.reservationId],
    references: [reservations.id],
  }),
}))

export const emailsRawRelations = relations(emailsRaw, ({ one }) => ({
  reservation: one(reservations, {
    fields: [emailsRaw.reservationId],
    references: [reservations.id],
  }),
  listing: one(listings, {
    fields: [emailsRaw.listingId],
    references: [listings.id],
  }),
}))

export const ownerBlocksRelations = relations(ownerBlocks, ({ one }) => ({
  unit: one(units, {
    fields: [ownerBlocks.unitId],
    references: [units.id],
  }),
}))

// Financial
export const chartOfAccountsRelations = relations(chartOfAccounts, ({ one, many }) => ({
  parent: one(chartOfAccounts, {
    fields: [chartOfAccounts.parentAccountId],
    references: [chartOfAccounts.id],
    relationName: 'chartOfAccounts_parent',
  }),
  children: many(chartOfAccounts, {
    relationName: 'chartOfAccounts_parent',
  }),
  vendorMappings: many(vendorMappings),
  merchantCategoryRules: many(merchantCategoryRules),
}))

export const sourceDocumentsRelations = relations(sourceDocuments, ({ many }) => ({
  transactions: many(financialTransactions),
}))

export const financialTransactionsRelations = relations(
  financialTransactions,
  ({ one, many }) => ({
    sourceDocument: one(sourceDocuments, {
      fields: [financialTransactions.sourceDocumentId],
      references: [sourceDocuments.id],
    }),
    reservation: one(reservations, {
      fields: [financialTransactions.reservationId],
      references: [reservations.id],
    }),
    allocations: many(transactionAllocations),
    expenseReviewQueue: many(expenseReviewQueue),
  })
)

export const transactionAllocationsRelations = relations(
  transactionAllocations,
  ({ one }) => ({
    transaction: one(financialTransactions, {
      fields: [transactionAllocations.financialTransactionId],
      references: [financialTransactions.id],
    }),
    property: one(properties, {
      fields: [transactionAllocations.propertyId],
      references: [properties.id],
    }),
    unit: one(units, {
      fields: [transactionAllocations.unitId],
      references: [units.id],
    }),
  })
)

export const vendorMappingsRelations = relations(vendorMappings, ({ one }) => ({
  chartOfAccount: one(chartOfAccounts, {
    fields: [vendorMappings.chartOfAccountId],
    references: [chartOfAccounts.id],
  }),
}))

export const merchantCategoryRulesRelations = relations(
  merchantCategoryRules,
  ({ one }) => ({
    chartOfAccount: one(chartOfAccounts, {
      fields: [merchantCategoryRules.correctAccountId],
      references: [chartOfAccounts.id],
    }),
  })
)

// AI/RAG
export const aiDocumentsRelations = relations(aiDocuments, ({ many }) => ({
  chunks: many(aiChunks),
}))

export const aiChunksRelations = relations(aiChunks, ({ one }) => ({
  document: one(aiDocuments, {
    fields: [aiChunks.documentId],
    references: [aiDocuments.id],
  }),
}))

// Operations
export const expenseReviewQueueRelations = relations(
  expenseReviewQueue,
  ({ one, many }) => ({
    transaction: one(financialTransactions, {
      fields: [expenseReviewQueue.financialTransactionId],
      references: [financialTransactions.id],
    }),
    reviewStates: many(expenseReviewState),
  })
)

export const expenseReviewStateRelations = relations(
  expenseReviewState,
  ({ one }) => ({
    currentReview: one(expenseReviewQueue, {
      fields: [expenseReviewState.currentReviewId],
      references: [expenseReviewQueue.id],
    }),
  })
)
