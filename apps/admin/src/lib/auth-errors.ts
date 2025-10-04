import { type AuthError } from '@supabase/supabase-js'

// Authentication error types
export enum AuthErrorType {
  // Login errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',

  // Signup errors
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',

  OTHER_USER_ERROR = 'OTHER_USER_ERROR',

  // Internal errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthUserError {
  type: AuthErrorType
  message: string
}

// Function to parse Supabase errors into user error, or an internal error
export const parseSupabaseError = (error: AuthError): AuthUserError => {
  if (error.code === 'user_already_exists') {
    return {
      type: AuthErrorType.USER_ALREADY_EXISTS,
      message: 'A user with this email already exists. Please log in instead.',
    }
  }

  if (error.code === 'invalid_credentials') {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      message: 'Invalid email or password. Please try again.',
    }
  }

  if (error.code === 'email_not_confirmed') {
    return {
      type: AuthErrorType.EMAIL_NOT_CONFIRMED,
      message: 'Email not confirmed.',
    }
  }

  if (error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit') {
    return {
      type: AuthErrorType.OTHER_USER_ERROR,
      message: 'Too many requests. Please wait a moment and try again.',
    }
  }
  return {
    type: AuthErrorType.UNKNOWN_ERROR,
    message: 'An unknown error occurred.',
  }
}
