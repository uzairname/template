'use client'

import { AuthErrorCard, createAuthErrorDetails } from '@/components/auth/auth-error-card'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const reason = searchParams.get('reason')
  const errorMessage = searchParams.get('error_message')
  const missing = searchParams.get('missing')

  const errorDetails = createAuthErrorDetails({
    reason,
    errorMessage,
    missing,
    onGoHome: () => router.push('/'),
    onTryAgain: () => router.refresh(),
    onTrySignIn: () => router.push('/'),
  })

  return <AuthErrorCard errorDetails={errorDetails} />
}

export default function AuthErrorPage() {
  return (
    <div
      className={'min-h-screen flex items-center justify-center bg-muted/30 px-4'}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}
