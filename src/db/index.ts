import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as appSchema from './schema'
import * as externalSchema from './external'

// =============================================================================
// DATABASE CLIENT
// Combines app-owned and external (n8n-owned) schemas for queries
// =============================================================================

// For server-side usage (API routes, Server Components)
// Use connection pooling URL from Supabase for production
const connectionString = process.env.DATABASE_URL!

// Disable prefetch for Supabase's connection pooler
const client = postgres(connectionString, {
  prepare: false,
  // Connection pool settings
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Combined schema for queries (both app-owned and external tables)
const combinedSchema = { ...appSchema, ...externalSchema }

export const db = drizzle(client, { schema: combinedSchema })

// =============================================================================
// EXPORTS
// =============================================================================

// Export app-owned schema (for writes and migrations)
export * from './schema'

// Export external schema under 'external' namespace (read-only)
export * as external from './external'

// Type helper for transactions
export type Database = typeof db
