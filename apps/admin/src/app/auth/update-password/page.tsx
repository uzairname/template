'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';
import { ErrorLayout } from '@/components/ui/error-layout';

function UpdatePasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');

  const handleSuccess = () => {
    router.push('/');
  };

  const handleError = () => {
    router.push('/auth/error?reason=password_update_failed');
  };

  if (error) {
    return (
      <ErrorLayout>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Password Reset Error</h1>
          <p className="text-muted-foreground">
            There was an error with your password reset link. Please try requesting a new one.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Go back to home
          </button>
        </div>
      </ErrorLayout>
    );
  }

  return (
    <ErrorLayout>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Update Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below.
          </p>
        </div>
        <UpdatePasswordForm 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ErrorLayout>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <ErrorLayout>
        <div className="text-center">Loading...</div>
      </ErrorLayout>
    }>
      <UpdatePasswordContent />
    </Suspense>
  );
}