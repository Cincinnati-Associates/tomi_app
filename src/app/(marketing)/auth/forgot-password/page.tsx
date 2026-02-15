import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Reset Password | Tomi',
  description: 'Reset your Tomi account password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
