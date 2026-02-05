import { z } from 'zod'

/**
 * Auth Validation Schemas
 *
 * Zod schemas for validating authentication inputs.
 * Used by both client-side forms and API routes.
 */

// Email validation
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim()

// Password validation (8+ chars for MVP)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')

/**
 * Registration schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').trim().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/**
 * Profile update schema
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').trim().optional(),
  phone: z
    .string()
    .transform(val => val ? val.replace(/[\s\-\(\)]/g, '') : val)
    .pipe(z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'))
    .optional()
    .nullable(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url('Please enter a valid URL').optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * Helper to format Zod errors for API responses
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}
