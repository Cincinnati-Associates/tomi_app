import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load .env.local for Next.js projects
config({ path: '.env.local' })

export default defineConfig({
  // IMPORTANT: Only app-owned schema is included in migrations
  // External (n8n-owned) tables in ./src/db/external/ are NOT migrated
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Use 'public' schema for Supabase
  schemaFilter: ['public'],
  verbose: true,
  strict: true,
})
