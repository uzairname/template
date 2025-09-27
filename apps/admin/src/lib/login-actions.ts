'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { Result, ok, err } from '@repo/utils/result'
import { AuthError, parseSupabaseError, unknownAuthError } from '@/lib/auth-errors'
import { nonNullable } from '@repo/utils'

export async function login(email: string, password: string): Promise<Result<void, AuthError>> {
  try {
    const supabase = await createClient()
    const data = { email, password }

    const { error: supabaseError } = await supabase.auth.signInWithPassword(data)

    if (supabaseError) {
      console.log("Login error:", supabaseError.message)
      return err(parseSupabaseError(supabaseError.message))
    }

    revalidatePath('/', 'layout')
    return ok()
  } catch (error) {
    console.error("Unexpected error during login:", error)
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

export async function resetPassword(email: string): Promise<Result<void, AuthError>> {
  try {
    const supabase = await createClient()

    const baseUrl = nonNullable(process.env.NEXT_PUBLIC_ADMIN_BASE_URL, "NEXT_PUBLIC_ADMIN_BASE_URL is not set")

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/update-password`,
    })

    console.log('Password reset email sent to:', email)

    if (supabaseError) {
      console.log("Password reset error:", supabaseError.message)
      return err(parseSupabaseError(supabaseError.message))
    }

    return ok()
  } catch (error) {
    console.error("Unexpected error during password reset:", error)
    return err(unknownAuthError)
  }
}

export async function updatePassword(password: string): Promise<Result<void, AuthError>> {
  try {
    const supabase = await createClient()

    const { error: supabaseError } = await supabase.auth.updateUser({
      password: password
    })

    if (supabaseError) {
      console.log("Password update error:", supabaseError.message)
      return err(parseSupabaseError(supabaseError.message))
    }

    revalidatePath('/', 'layout')
    return ok()
  } catch (error) {
    console.error("Unexpected error during password update:", error)
    return err(unknownAuthError)
  }
}
