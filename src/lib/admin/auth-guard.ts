import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export type AdminRole = 'admin' | 'superadmin'

export interface AdminAuthResult {
  userId: string
  email: string
  role: AdminRole
}

/**
 * Server-side admin auth guard for API routes.
 * Verifies the caller is authenticated and has at least the required admin role.
 *
 * Returns AdminAuthResult on success, or a NextResponse (401/403) on failure.
 */
export async function requireAdmin(
  requiredRole: AdminRole = 'admin'
): Promise<AdminAuthResult | NextResponse> {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceRoleClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'user') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (requiredRole === 'superadmin' && profile.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden: superadmin required' }, { status: 403 })
  }

  return {
    userId: user.id,
    email: user.email || '',
    role: profile.role as AdminRole,
  }
}

/**
 * Type guard to check if the result is an error response.
 */
export function isAdminError(
  result: AdminAuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}
