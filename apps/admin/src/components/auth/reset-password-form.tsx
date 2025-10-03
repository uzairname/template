'use client'

import { AuthUserError, parseSupabaseError } from '@/lib/auth-errors'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { captureException } from '@sentry/nextjs'
import { useState } from 'react'
import { z } from 'zod'

const passwordSchema = z
  .object({
    password: z.string().min(10, 'Password must be at least 10 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>
type ValidationErrors = Partial<Record<keyof PasswordFormData, string>>

interface ResetPasswordFormProps {
  onSuccess?: () => void
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [authError, setAuthError] = useState<AuthUserError | null>(null)

  const validateForm = (): boolean => {
    const result = passwordSchema.safeParse(formData)

    if (result.success) {
      setValidationErrors({})
      return true
    }

    const errors: ValidationErrors = {}
    result.error.issues.forEach((error) => {
      const field = error.path[0] as keyof PasswordFormData
      if (!errors[field]) {
        errors[field] = error.message
      }
    })

    setValidationErrors(errors)
    return false
  }

  const setFormField = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setAuthError(null)
  }

  const handleSubmit = async () => {
    setShowValidationErrors(true)

    if (!validateForm()) return

    setLoading(true)
    setAuthError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: formData.password,
    })

    if (error) {
      captureException(error)
      setAuthError(parseSupabaseError(error))
    } else {
      // Refresh the client-side session to trigger auth state change
      await supabase.auth.refreshSession()
      onSuccess?.()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your new password"
          value={formData.password}
          onChange={(e) => setFormField('password', e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.password && (
          <div className="text-sm text-destructive">{validationErrors.password}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={(e) => setFormField('confirmPassword', e.target.value)}
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

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !formData.password || !formData.confirmPassword}
        className="w-full"
      >
        {loading ? 'Updating password...' : 'Update Password'}
      </Button>
    </div>
  )
}
