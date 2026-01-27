import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  date,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// =============================================================================
// EXTERNAL TABLES - FINANCIAL (n8n-owned)
// READ-ONLY: These tables are managed by n8n pipelines
// Do NOT modify these directly - they should only be updated after n8n changes
// =============================================================================

export const chartOfAccounts = pgTable(
  'chart_of_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    parentAccountId: uuid('parent_account_id'),
    name: text('name').notNull(),
    type: text('type').notNull(),
    code: text('code'),
    description: text('description'),
  },
  (table) => [
    unique('uq_name_parent').on(table.parentAccountId, table.name),
    unique('chart_of_accounts_code_key').on(table.code),
  ]
)

export const vendors = pgTable(
  'vendors',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    name: text('name').notNull(),
    type: text('type').default('other').notNull(),
    contactInfo: jsonb('contact_info').default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`utc_now()`)
      .notNull(),
  },
  (table) => [
    index('vendors_name_idx').using('gin', table.name),
    index('vendors_type_idx').using('btree', table.type),
  ]
)

export const sourceDocuments = pgTable(
  'source_documents',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    fileId: text('file_id').notNull(),
    fileName: text('file_name').notNull(),
    fileHash: text('file_hash').notNull(),
    institution: text('institution'),
    accountNumber: text('account_number'),
    statementDate: date('statement_date'),
    documentType: text('document_type'),
    processedDate: timestamp('processed_date', {
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }),
    rawData: jsonb('raw_data'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    beginningBalance: numeric('beginning_balance', { precision: 10, scale: 2 }),
    endingBalance: numeric('ending_balance', { precision: 10, scale: 2 }),
    reconciliationStatus: text('reconciliation_status').default('pending'),
    testEnvironment: text('test_environment').default('production'),
    telegramChatId: text('telegram_chat_id'),
  },
  (table) => [
    index('idx_source_docs_test_env').using('btree', table.testEnvironment),
    index('idx_statements_document_type').using('btree', table.documentType),
    index('idx_statements_file_hash').using('btree', table.fileHash),
    index('idx_statements_institution').using('btree', table.institution),
    index('idx_statements_statement_date').using('btree', table.statementDate),
    unique('statements_file_hash_key').on(table.fileHash),
  ]
)

export const financialTransactions = pgTable(
  'financial_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    sourceDocumentId: uuid('source_document_id').notNull(),
    txDate: date('tx_date').notNull(),
    description: text('description').notNull(),
    merchant: text('merchant'),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    transactionType: text('transaction_type'),
    source: text('source'),
    cardholder: text('cardholder'),
    principal: numeric('principal', { precision: 12, scale: 2 }),
    interest: numeric('interest', { precision: 12, scale: 2 }),
    escrow: numeric('escrow', { precision: 12, scale: 2 }),
    fees: numeric('fees', { precision: 12, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    reservationId: uuid('reservation_id'),
    // descriptionTsv: tsvector - skipped (special type)
    testEnvironment: text('test_environment').default('production'),
  },
  (table) => [
    index('idx_fin_tx_date').using('btree', table.txDate),
    index('idx_fin_tx_date_type').using(
      'btree',
      table.txDate,
      table.transactionType
    ),
    index('idx_fin_tx_merchant').using('btree', table.merchant),
    index('idx_fin_tx_source').using('btree', table.source),
    index('idx_financial_txns_test_env').using('btree', table.testEnvironment),
    index('idx_transactions_amount').using('btree', table.amount),
    index('idx_transactions_date').using('btree', table.txDate),
    index('idx_transactions_statement_id').using(
      'btree',
      table.sourceDocumentId
    ),
    index('idx_transactions_type').using('btree', table.transactionType),
  ]
)

export const transactionAllocations = pgTable(
  'transaction_allocations',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    financialTransactionId: uuid('financial_transaction_id').notNull(),
    chartOfAccountId: uuid('chart_of_account_id').notNull(),
    propertyId: uuid('property_id'),
    unitId: uuid('unit_id'),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    needsReview: boolean('needs_review').default(false),
    testEnvironment: text('test_environment').default('production'),
    isSplit: boolean('is_split').default(false),
  },
  (table) => [
    index('idx_allocations_needs_review').using('btree', table.needsReview),
    index('idx_allocations_test_env').using('btree', table.testEnvironment),
    index('idx_allocations_tx_id').using('btree', table.financialTransactionId),
    unique('unique_transaction_allocation').on(
      table.financialTransactionId,
      table.chartOfAccountId
    ),
  ]
)

export const vendorMappings = pgTable(
  'vendor_mappings',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    merchantPattern: text('merchant_pattern').notNull(),
    chartOfAccountId: uuid('chart_of_account_id').notNull(),
    splitAcrossUnits: boolean('split_across_units').default(false),
    confidence: numeric('confidence').default('1.0'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_vendor_mappings_merchant').using('btree', table.merchantPattern),
    unique('vendor_mappings_merchant_pattern_unique').on(table.merchantPattern),
  ]
)

export const expenseCategories = pgTable(
  'expense_categories',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('name').notNull(),
    subcategories: text('subcategories').array(),
    isOperatingExpense: boolean('is_operating_expense').default(true),
    parentCategory: text('parent_category'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [unique('expense_categories_name_key').on(table.name)]
)

export const merchantCategoryRules = pgTable(
  'merchant_category_rules',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    merchantPattern: text('merchant_pattern').notNull(),
    correctAccountId: uuid('correct_account_id'),
    correctAccountName: text('correct_account_name'),
    ruleType: text('rule_type').default('contains'),
    priority: integer('priority').default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('idx_merchant_rules_pattern').using('btree', table.merchantPattern),
  ]
)

// =============================================================================
// TYPES
// =============================================================================

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect
export type Vendor = typeof vendors.$inferSelect
export type SourceDocument = typeof sourceDocuments.$inferSelect
export type FinancialTransaction = typeof financialTransactions.$inferSelect
export type TransactionAllocation = typeof transactionAllocations.$inferSelect
export type VendorMapping = typeof vendorMappings.$inferSelect
export type ExpenseCategory = typeof expenseCategories.$inferSelect
export type MerchantCategoryRule = typeof merchantCategoryRules.$inferSelect
