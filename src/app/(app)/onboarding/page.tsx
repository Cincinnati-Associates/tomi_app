import { redirect } from 'next/navigation'

export default function OnboardingPage() {
  // Redirect to the journey page (replaces old onboarding flow)
  redirect('/journey')
}
