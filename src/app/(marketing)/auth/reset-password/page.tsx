import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Set New Password | Tomi',
  description: 'Set a new password for your Tomi account',
}

/**
 * The reset password page receives a `code` query param from Supabase's
 * password reset email. The client-side ResetPasswordForm exchanges
 * this code for a session before allowing the user to set a new password.
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6">
          <Suspense fallback={<div className="text-center py-12"><div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
