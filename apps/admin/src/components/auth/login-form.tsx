'use client'

import { AuthErrorType, AuthUserError, parseSupabaseError } from '@/lib/auth-errors'
import { login, sendPasswordResetEmail } from '@/lib/login-actions'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useMemo, useState } from 'react'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>
type ValidationErrors = Partial<Record<keyof LoginFormData, string>>

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [authError, setAuthError] = useState<AuthUserError | null>(null)
  const [showConfirmEmailInfo, setShowConfirmEmailInfo] = useState(false)

  const isValidEmail = useMemo(() => {
    return z.email().safeParse(formData.email).success
  }, [formData.email])

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse(formData)

    if (result.success) {
      setValidationErrors({})
      return true
    }

    const errors: ValidationErrors = {}
    result.error.issues.forEach((error) => {
      const field = error.path[0] as keyof LoginFormData
      if (!errors[field]) {
        errors[field] = error.message
      }
    })

    setValidationErrors(errors)
    return false
  }

  const setFormField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setAuthError(null)
    setForgotPasswordSuccess(false)
  }

  const resendConfirmationEmail = async () => {
    if (!isValidEmail) {
      setValidationErrors({ email: 'Please enter a valid email address' })
      setShowValidationErrors(true)
      return
    }
    setValidationErrors({})

    const supabase = createClient()

    const { error } = await supabase.auth.resend({
      email: formData.email,
      type: 'signup',
    })
    if (error) {
      setAuthError(parseSupabaseError(error))
    } else {
      setShowConfirmEmailInfo(true)
    }
  }

  const handleSubmit = async () => {
    // Validate and show errors on submit attempt
    setShowValidationErrors(true)

    // Do nothing if form is invalid
    if (!validateForm()) return

    setLoading(true)
    setAuthError(null)

    const result = await login(formData.email, formData.password)

    if (!result.success) {
      if (result.error.type === AuthErrorType.EMAIL_NOT_CONFIRMED) {
        setShowConfirmEmailInfo(true)
      } else {
        setShowConfirmEmailInfo(false)
      }
      setAuthError(result.error)
    } else {
      // Refresh the client-side session to trigger auth state change
      const supabase = createClient()
      await supabase.auth.refreshSession()

      onSuccess?.()
    }

    setLoading(false)
  }

  const handleForgotPassword = async () => {
    // Only require email for password reset
    if (!isValidEmail) {
      setValidationErrors({ email: 'Please enter a valid email address' })
      setShowValidationErrors(true)
      return
    }

    setAuthError(null)
    setValidationErrors({})

    const result = await sendPasswordResetEmail(formData.email)

    if (!result.success) {
      setAuthError(result.error)
    } else {
      setForgotPasswordSuccess(true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormField('email', e.target.value)}
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
          onChange={(e) => setFormField('password', e.target.value)}
          required
        />
        {showValidationErrors && validationErrors.password && (
          <div className="text-sm text-destructive">{validationErrors.password}</div>
        )}
      </div>

      {forgotPasswordSuccess && (
        <div className="space-y-3">
          <div className="text-sm text-green-600">
            Password reset instructions have been sent to your email.
          </div>
        </div>
      )}

      {authError && (
        <div className="space-y-3">
          <div className="text-sm text-destructive">{authError.message}</div>
        </div>
      )}

      {showConfirmEmailInfo && (
        <div className="space-y-3">
          <Button
            type="button"
            variant="link"
            onClick={resendConfirmationEmail}
            className="p-0 text-sm"
          >
            Click here to resend confirmation email
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isValidEmail || !formData.password}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleForgotPassword}
          disabled={!isValidEmail}
          className="w-full text-sm"
        >
          {'Forgot password'}
        </Button>
      </div>
    </div>
  )
}
