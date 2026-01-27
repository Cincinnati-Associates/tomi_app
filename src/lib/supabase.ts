import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if available
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, return a mock client that won't make real requests
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Auth features will be disabled.')
    // Return a minimal mock for build-time rendering
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
