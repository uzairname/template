import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  // Check if required parameters are missing
  if (!token_hash || !type) {
    const missingParams = [];
    if (!token_hash) missingParams.push('token_hash');
    if (!type) missingParams.push('type');
    
    redirect(`/auth/error?reason=missing_params&missing=${missingParams.join(',')}`);
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (error) {
    // Provide specific error information
    const errorParams = new URLSearchParams({
      reason: 'verification_failed',
      error_code: error.name || 'unknown',
      error_message: error.message || 'Verification failed',
      type: type,
    });
    
    redirect(`/auth/error?${errorParams.toString()}`);
  }

  // Success - redirect user to specified redirect URL or root of app
  redirect(next);
}