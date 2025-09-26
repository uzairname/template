'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AuthErrorCard, createAuthErrorDetails } from '@/components/auth/auth-error-card';
import { ErrorLayout } from '@/components/ui/error-layout';

export default function AuthErrorPage() {
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

  return (
    <ErrorLayout>
      <AuthErrorCard errorDetails={errorDetails} />
    </ErrorLayout>
  );
}