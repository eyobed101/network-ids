// app/auth/error/page.tsx
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const error = searchParams.get('error');

  useEffect(() => {
    // Clear the error from the URL
    if (error) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [error]);

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