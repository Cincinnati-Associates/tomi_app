import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Set New Password | Tomi',
  description: 'Set a new password for your Tomi account',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
