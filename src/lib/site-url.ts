/**
 * Get the site URL for auth redirects.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL env var (explicit, works everywhere)
 * 2. VERCEL_URL (auto-set by Vercel, includes preview deployment URLs)
 * 3. Fallback to localhost for local dev
 */
export function getSiteUrl(): string {
  // Explicit override — set this in production
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Vercel auto-sets this for deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Local development fallback
  return 'http://localhost:3000'
}
