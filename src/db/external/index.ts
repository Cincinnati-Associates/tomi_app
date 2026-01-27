// =============================================================================
// EXTERNAL SCHEMA (n8n-owned tables)
// READ-ONLY: These tables are managed by n8n pipelines
// Do NOT modify these directly - they should only be updated after n8n changes
//
// IMPORTANT: This schema is NOT included in Drizzle migrations.
// It provides TypeScript types and query builder support only.
// =============================================================================

// Enums
export * from './enums'

// Tables
export * from './rentals'
export * from './financial'
export * from './ai'
export * from './operations'

// Relations
export * from './relations'
