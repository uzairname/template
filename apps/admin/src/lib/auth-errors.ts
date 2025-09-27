// Authentication error types
export enum AuthErrorType {
  // Login errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  
  // Signup errors
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  
  // General errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

// Helper function to create auth errors
export const createAuthError = (
  type: AuthErrorType, 
  message: string, 
): AuthError => ({
  type,
  message,
});

export const unknownAuthError: AuthError = createAuthError(
  AuthErrorType.UNKNOWN_ERROR, 
  'An unknown error occurred.'
);

// Function to parse Supabase errors into our error types
export const parseSupabaseError = (errorMessage: string): AuthError => {
  const msg = errorMessage.toLowerCase();
  
  // Login-related errors
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return createAuthError(
      AuthErrorType.INVALID_CREDENTIALS,
      'Invalid email or password.',
    );
  }
  
  if (msg.includes('user not found') || msg.includes('email not found')) {
    return createAuthError(
      AuthErrorType.USER_NOT_FOUND,
      'No account found with this email.',
    );
  }
  
  if (msg.includes('email not confirmed') || msg.includes('confirm your email')) {
    return createAuthError(
      AuthErrorType.EMAIL_NOT_CONFIRMED,
      'Please check your email and confirm your account before signing in.'
    );
  }
  
  // Signup-related errors
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already exists')) {
    return createAuthError(
      AuthErrorType.USER_ALREADY_EXISTS,
      'An account with this email already exists.',
    );
  }
  
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('characters'))) {
    return createAuthError(
      AuthErrorType.WEAK_PASSWORD,
      'Password is too weak. Please use at least 6 characters.'
    );
  }
  
  if (msg.includes('invalid email') || msg.includes('email format')) {
    return createAuthError(
      AuthErrorType.INVALID_EMAIL,
      'Please enter a valid email address.'
    );
  }
  
  // Network/connection errors
  if (msg.includes('network') || msg.includes('connection') || msg.includes('fetch')) {
    return createAuthError(
      AuthErrorType.NETWORK_ERROR,
      'Connection error. Please check your internet and try again.'
    );
  }
  
  // Fallback for unknown errors
  return createAuthError(
    AuthErrorType.UNKNOWN_ERROR,
    errorMessage || 'An unexpected error occurred.'
  );
};
