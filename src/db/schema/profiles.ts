import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  varchar,
} from 'drizzle-orm/pg-core'

/**
 * User Profiles
 *
 * Extends Supabase auth.users with application-specific profile data.
 * The id column references auth.users.id (managed by Supabase trigger).
 *
 * PRD-001: Authentication & User Profile
 */
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(), // References auth.users
    email: text('email'),
    phone: text('phone'),
    fullName: text('full_name'), // PRD-001 §4.1 - display_name mapped to full_name
    avatarUrl: text('avatar_url'),
    timezone: varchar('timezone', { length: 50 }).default('UTC'), // PRD-001 §4.1 - IANA timezone
    onboardingCompleted: boolean('onboarding_completed').default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_profiles_email').on(table.email),
    index('idx_profiles_phone').on(table.phone),
  ]
)

// Relations defined in relations.ts to avoid circular imports

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
