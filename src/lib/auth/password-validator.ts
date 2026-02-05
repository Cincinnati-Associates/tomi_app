/**
 * Password Validation Utility
 *
 * Validates password strength and provides feedback for the UI.
 * PRD-001 specified 12+ chars, but we're using 8+ for MVP to reduce friction.
 * Visual strength meter encourages users toward stronger passwords.
 */

export interface PasswordRequirement {
  id: string
  label: string
  met: boolean
}

export interface PasswordValidation {
  isValid: boolean
  strength: 'weak' | 'fair' | 'strong'
  score: number // 0-100
  requirements: PasswordRequirement[]
  errors: string[]
}

const MIN_LENGTH = 8
const STRONG_LENGTH = 12

/**
 * Check individual password requirements
 */
function checkRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: 'length',
      label: `At least ${MIN_LENGTH} characters`,
      met: password.length >= MIN_LENGTH,
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'One number',
      met: /\d/.test(password),
    },
    {
      id: 'special',
      label: 'One special character',
      met: /[!@#$%^&*(),.?":{}|<>[\]\\;'`~_+=/-]/.test(password),
    },
  ]
}

/**
 * Calculate password strength score (0-100)
 */
function calculateScore(password: string, requirements: PasswordRequirement[]): number {
  if (!password) return 0

  let score = 0
  const metCount = requirements.filter((r) => r.met).length

  // Base score from requirements (60% weight)
  score += (metCount / requirements.length) * 60

  // Bonus for length (40% weight)
  if (password.length >= STRONG_LENGTH) {
    score += 40
  } else if (password.length >= MIN_LENGTH) {
    // Scale between 8-12 chars
    const lengthBonus = ((password.length - MIN_LENGTH) / (STRONG_LENGTH - MIN_LENGTH)) * 40
    score += lengthBonus
  }

  // Bonus for variety of character types
  const hasMultipleSpecial = (password.match(/[!@#$%^&*(),.?":{}|<>[\]\\;'`~_+=/-]/g) || []).length > 1
  const hasMultipleNumbers = (password.match(/\d/g) || []).length > 1
  if (hasMultipleSpecial) score = Math.min(100, score + 5)
  if (hasMultipleNumbers) score = Math.min(100, score + 5)

  return Math.round(Math.min(100, score))
}

/**
 * Determine strength category from score
 */
function getStrength(score: number): 'weak' | 'fair' | 'strong' {
  if (score >= 80) return 'strong'
  if (score >= 50) return 'fair'
  return 'weak'
}

/**
 * Validate a password and return detailed feedback
 */
export function validatePassword(password: string): PasswordValidation {
  const requirements = checkRequirements(password)
  const errors = requirements.filter((r) => !r.met).map((r) => r.label + ' required')
  const score = calculateScore(password, requirements)
  const strength = getStrength(score)

  // Password is valid if minimum length is met (we encourage but don't block on other requirements)
  // For MVP, we only strictly require 8 chars
  const isValid = password.length >= MIN_LENGTH

  return {
    isValid,
    strength,
    score,
    requirements,
    errors: isValid ? [] : errors,
  }
}

/**
 * Quick check if password meets minimum requirements
 */
export function isPasswordValid(password: string): boolean {
  return password.length >= MIN_LENGTH
}

/**
 * Get strength color for UI
 */
export function getStrengthColor(strength: 'weak' | 'fair' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'text-green-500'
    case 'fair':
      return 'text-yellow-500'
    case 'weak':
      return 'text-red-500'
  }
}

/**
 * Get strength background color for progress bar
 */
export function getStrengthBgColor(strength: 'weak' | 'fair' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'bg-green-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'weak':
      return 'bg-red-500'
  }
}
