'use client'

import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function UpdatePasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const error = searchParams.get('error')

  const handleSuccess = () => {
    router.push('/')
  }

  if (error) {
    return (
      <div
        className='min-h-screen flex items-center justify-center bg-muted/30 px-4'
      >
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Password Reset Error</h1>
          <p className="text-muted-foreground">
            There was an error with your password reset link. Please try requesting a new one.
          </p>
          <button onClick={() => router.push('/')} className="text-primary hover:underline">
            Go back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center bg-muted/30 px-4'
    >
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Update Your Password</h1>
          <p className="text-muted-foreground">Enter your new password below.</p>
        </div>
        <UpdatePasswordForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className='min-h-screen flex items-center justify-center bg-muted/30 px-4'
        >
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <UpdatePasswordContent />
    </Suspense>
  )
}
