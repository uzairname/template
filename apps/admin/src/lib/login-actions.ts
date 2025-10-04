'use server'

import { AuthErrorType, type AuthUserError, parseSupabaseError } from '@/lib/auth-errors'
import { createClient } from '@/utils/supabase/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { type Result, err, ok } from '@repo/utils/result'

export async function login(
  email: string,
  password: string
): Promise<Result<{ needsConfirmEmail?: boolean } | void, AuthUserError>> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return err(parseSupabaseError(error))
  } else {
    console.info(`User logged in: ${data.user.email}`)
    // If there is a user but no session, it means the user needs to confirm their email
    if (data.user && !data.session) {
      return ok({ needsConfirmEmail: true })
    }
    return ok()
  }
}

export async function signup(
  email: string,
  password: string,
  name?: string
): Promise<Result<{ needsConfirmEmail?: boolean } | void, AuthUserError>> {
  const supabase = await createClient()

  const { env } = getCloudflareContext()

  const baseUrl = env.ADMIN_BASE_URL

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: name
      ? {
          data: {
            name: name,
          },
          emailRedirectTo: `${baseUrl}`,
        }
      : undefined,
  })

  if (error) {
    const authError = parseSupabaseError(error)
    if (authError.type === AuthErrorType.USER_ALREADY_EXISTS) {
      return await login(email, password)
    }
    return err(authError)
  } else {
    // If there is a user but no session, it means the user needs to confirm their email
    if (data.user && !data.session) {
      return ok({ needsConfirmEmail: true })
    }
    return ok()
  }
}

export async function sendPasswordResetEmail(email: string): Promise<Result<void, AuthUserError>> {
  const supabase = await createClient()

  const { env } = getCloudflareContext()

  const baseUrl = env.ADMIN_BASE_URL

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/reset-password`,
  })

  if (error) {
    return err(parseSupabaseError(error))
  }
  return ok()
}
