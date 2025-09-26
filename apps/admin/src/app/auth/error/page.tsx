'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { AuthErrorCard, createAuthErrorDetails } from '@/components/auth/auth-error-card';
import { ErrorLayout } from '@/components/ui/error-layout';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const reason = searchParams.get('reason');
  const errorMessage = searchParams.get('error_message');
  const missing = searchParams.get('missing');

  const errorDetails = createAuthErrorDetails({
    reason,
    errorMessage,
    missing,
    onRequestNew: () => router.push('/auth/resend'),
    onGoHome: () => router.push('/'),
    onTryAgain: () => router.refresh(),
    onTrySignIn: () => router.push('/'),
  });

  return <AuthErrorCard errorDetails={errorDetails} />;
}

export default function AuthErrorPage() {
  return (
    <ErrorLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </ErrorLayout>
  );
}