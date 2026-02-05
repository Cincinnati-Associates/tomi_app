"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Globe, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileData {
  fullName: string | null
  phone: string | null
  timezone: string | null
  avatarUrl: string | null
  onboardingCompleted: boolean
}

interface ProfileFormProps {
  initialData: ProfileData
  onSave?: () => void
}

// Common timezones for the dropdown
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
]

export function ProfileForm({ initialData, onSave }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialData.fullName || '')
  const [phone, setPhone] = useState(initialData.phone || '')
  const [timezone, setTimezone] = useState(initialData.timezone || 'America/New_York')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Detect browser timezone on mount
  useEffect(() => {
    if (!initialData.timezone) {
      try {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const matchingTimezone = TIMEZONES.find(tz => tz.value === browserTimezone)
        if (matchingTimezone) {
          setTimezone(browserTimezone)
        }
      } catch {
        // Fallback to Eastern if detection fails
      }
    }
  }, [initialData.timezone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName || undefined,
          phone: phone || null,
          timezone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        setSaveStatus('error')
      } else {
        setSaveStatus('saved')
        onSave?.()
        // Reset to idle after showing success
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setSaveStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Format as US phone number
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Full Name */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This is how you&apos;ll appear to other co-buyers
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-foreground">
          Phone Number <span className="text-muted-foreground">(optional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          For important notifications about your co-buying journey
        </p>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <label htmlFor="timezone" className="block text-sm font-medium text-foreground">
          Timezone
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !fullName.trim()}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          saveStatus === 'saved'
            ? "bg-green-500 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : saveStatus === 'saved' ? (
          <>
            <Check className="w-5 h-5" />
            Saved
          </>
        ) : (
          'Save Profile'
        )}
      </button>
    </motion.form>
  )
}
