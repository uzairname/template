'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Result, ok, err } from '@repo/utils/result'
import { AuthError, parseSupabaseError, unknownAuthError } from '@/lib/auth-errors'

export async function login(email: string, password: string): Promise<Result<void, AuthError>> {
  try {
    const supabase = await createClient()
    const data = { email, password }

    const { error: supabaseError } = await supabase.auth.signInWithPassword(data)

    if (supabaseError) {
      return err(parseSupabaseError(supabaseError.message))
    }

    revalidatePath('/', 'layout')
    return ok()
  } catch (error) {
    console.error("Unexpected error during login:", error)
    return err(unknownAuthError)
  }
}

export async function checkUserExists(email: string): Promise<Result<{ exists: boolean }, AuthError>> {
  try {
    const supabase = await createClient()
    
    // Try to get user by email using the admin API if available
    // For most cases, we can check by attempting a password reset which will tell us if user exists
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000', // This won't be sent, we just need to check if user exists
    })

    if (error) {
      // If the error indicates user doesn't exist, that's what we wanted to know
      if (error.message.toLowerCase().includes('user not found') || 
          error.message.toLowerCase().includes('email not found')) {
        return ok({ exists: false })
      }
      // For other errors, we can't determine existence, so return the error
      return err(parseSupabaseError(error.message))
    }

    // If no error, user likely exists
    return ok({ exists: true })
  } catch (error) {
    console.error("Unexpected error checking user existence:", error)
    return err(unknownAuthError)
  }
}

export async function signup(email: string, password: string, name?: string): Promise<Result<void, AuthError>> {
  try {
    const supabase = await createClient()
    const data = { 
      email, 
      password,
      options: name ? {
        data: {
          full_name: name,
        }
      } : undefined
    }

    const { data: signupData, error: supabaseError } = await supabase.auth.signUp(data)

    if (supabaseError) {
      console.log("Sign up error:", supabaseError.message)
      return err(parseSupabaseError(supabaseError.message))
    }

    // If signup returns a user but no session, it might be an existing user
    // In this case, attempt to sign in instead
    if (signupData.user && !signupData.session) {
      return await login(email, password)
    }

    revalidatePath('/', 'layout')
    return ok()
  } catch (error) {
    console.error("Unexpected error during signup:", error)
    return err(unknownAuthError)
  }
}
