"use client"

import { HomeBaseShell } from '@/components/homebase/HomeBaseShell'
import { PageIntro } from '@/components/shared/PageIntro'

export default function HomeBasePage() {
  return (
    <>
      <PageIntro
        pageId="homebase"
        title="Welcome to HomeBase"
        description="Your shared home management hub. Chat with Homi to manage documents, tasks, and everything about your co-owned property."
        bullets={[
          'Upload and search important documents',
          'Track tasks and home projects together',
          'Ask Homi anything about your home',
        ]}
        ctaText="Get Started"
      />
      <HomeBaseShell />
    </>
  )
}
