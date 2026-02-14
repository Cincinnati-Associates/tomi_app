"use client"

import { useAuthContext } from '@/providers/AuthProvider'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import type { Profile } from '@/types/user'

export default function ProfileSettingsPage() {
  const { profile: contextProfile, refreshProfile, isLoading: authLoading, user } = useAuthContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch profile from the API (server-side, bypasses RLS issues)
  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else if (res.status === 401) {
        setError('Not authenticated')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to load profile')
      }
    } catch (err) {
      console.error('[ProfilePage] Fetch error:', err)
      setError('Network error loading profile')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load profile when auth is ready
  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile()
    } else if (!authLoading && !user) {
      setIsLoading(false)
      setError('Not authenticated')
    }
  }, [authLoading, user, fetchProfile])

  // Also accept profile from context if API hasn't loaded yet
  useEffect(() => {
    if (contextProfile && !profile) {
      setProfile(contextProfile)
    }
  }, [contextProfile, profile])

  const handleSave = async () => {
    await refreshProfile()
    await fetchProfile()
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-muted-foreground">{error || 'Unable to load profile'}</div>
        <button
          onClick={fetchProfile}
          className="text-primary hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <ProfileForm
          initialData={{
            fullName: profile.full_name,
            phone: profile.phone,
            timezone: profile.timezone,
            avatarUrl: profile.avatar_url,
            onboardingCompleted: profile.onboarding_completed,
          }}
          onSave={handleSave}
        />
      </div>

      {/* Email Section (Read-only) */}
      <div className="mt-6 bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Email Address</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground">{profile.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your email address is managed through your authentication provider.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
          onClick={() => {
            alert('Account deletion coming soon. Contact support for now.')
          }}
        >
          Delete Account
        </button>
      </div>
    </motion.div>
  )
}
