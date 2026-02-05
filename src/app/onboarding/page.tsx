import { redirect } from 'next/navigation'

export default function OnboardingPage() {
  // Redirect to welcome as the first step
  redirect('/onboarding/welcome')
}
