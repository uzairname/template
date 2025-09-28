'use client'

import { AuthUserError, parseSupabaseError } from '@/lib/auth-errors'
import { signup } from '@/lib/login-actions'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useState } from 'react'
import { z } from 'zod'

const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),

    email: z.email(),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(10, 'Password must be at least 10 characters')
      .max(128, 'Password must be less than 128 characters'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>
type ValidationErrors = Partial<Record<keyof SignupFormData, string>>

interface SignupFormProps {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<AuthUserError | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [showConfirmEmailInfo, setShowConfirmEmailInfo] = useState(false)

  const validateForm = (): boolean => {
    const result = signupSchema.safeParse(formData)

    if (result.success) {
      setValidationErrors({})
      return true
    }

    const errors: ValidationErrors = {}
    result.error.issues.forEach((error) => {
      const field = error.path[0] as keyof SignupFormData
      if (!errors[field]) {
        errors[field] = error.message
      }
    })

    setValidationErrors(errors)
    return false
  }

  const handleFieldChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setAuthError(null)
    setShowConfirmEmailInfo(false)
  }

  const handleSubmit = async () => {
    // Validate and show errors on submit attempt
    setShowValidationErrors(true)

    // Do nothing if form is invalid
    if (!validateForm()) return

    setLoading(true)
    setAuthError(null)

    const result = await signup(formData.email, formData.password, formData.name)

    if (result.success) {
      if (result.data?.needsConfirmEmail) {
        setShowConfirmEmailInfo(true)
      } else {
        setShowConfirmEmailInfo(false)
        // Refresh the client-side session to trigger auth state change
        const supabase = createClient()
        await supabase.auth.refreshSession()
        
        onSuccess?.()
      }
    } else {
      setAuthError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your preferred name"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.name && (
          <div className="text-sm text-destructive">{validationErrors.name}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.email && (
          <div className="text-sm text-destructive">{validationErrors.email}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.password && (
          <div className="text-sm text-destructive">{validationErrors.password}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.confirmPassword && (
          <div className="text-sm text-destructive">{validationErrors.confirmPassword}</div>
        )}
      </div>

      {authError && (
        <div className="space-y-3">
          <div className="text-sm text-destructive">{authError.message}</div>
        </div>
      )}

      {showConfirmEmailInfo && (
        <div className="space-y-3">
          <div className="text-sm text-green-600">
            Account created! Please check your email to confirm your address before logging in.
          </div>
        </div>
      )}

      <Button type="button" onClick={handleSubmit} disabled={loading || showConfirmEmailInfo} className="w-full">
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </div>
  )
}
