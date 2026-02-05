"use client"

import React, { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  validatePassword,
  getStrengthBgColor,
  type PasswordValidation,
} from '@/lib/auth/password-validator'

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
  className?: string
}

/**
 * Visual password strength indicator with optional requirements checklist
 */
export function PasswordStrengthMeter({
  password,
  showRequirements = true,
  className,
}: PasswordStrengthMeterProps) {
  const validation: PasswordValidation = useMemo(
    () => validatePassword(password),
    [password]
  )

  if (!password) {
    return null
  }

  const strengthLabel = {
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn(
              'font-medium',
              validation.strength === 'strong' && 'text-green-500',
              validation.strength === 'fair' && 'text-yellow-500',
              validation.strength === 'weak' && 'text-red-500'
            )}
          >
            {strengthLabel[validation.strength]}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', getStrengthBgColor(validation.strength))}
            initial={{ width: 0 }}
            animate={{ width: `${validation.score}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs"
        >
          {validation.requirements.map((req) => (
            <li
              key={req.id}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                req.met ? 'text-green-500' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3 flex-shrink-0" />
              ) : (
                <X className="h-3 w-3 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}
