// app/auth/error/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

function ErrorContent() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Client-side only parsing of search params
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    setError(errorParam);

    // Clear the error from the URL
    if (errorParam) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, []);

  const errorMessages: Record<string, string> = {
    Configuration: 'There was a server configuration error',
    AccessDenied: 'You do not have permission to sign in',
    Verification: 'The token has expired or is invalid',
    Default: 'An unexpected error occurred',
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Alert className="w-[400px]">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>
          {error ? errorMessages[error] || error : 'Unknown error occurred'}
        </AlertDescription>
        <button 
          onClick={() => router.push('/auth/login')}
          className="mt-4 text-sm text-blue-500 hover:underline"
        >
          Return to login
        </button>
      </Alert>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="w-[400px]">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Loading...</AlertTitle>
        </Alert>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
