// lib/auth.ts
import { signIn, signOut, getSession } from 'next-auth/react';
import { AuthError } from './errors';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}

export const login = async (email: string, password: string) => {
  const result = await signIn('credentials', {
    redirect: false,
    email,
    password,
    callbackUrl: '/dashboard'
  });

  console.log('Login result:', result);

  if (result?.error) {
    console.log('Login result:', result);

    throw new AuthError(result.error, 401);
  }

  return result;
};

export const logout = async () => {
  const session = await getSession();
  
  if (session?.refreshToken) {
    try {
      // Call your backend logout endpoint if needed
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ refreshToken: session.refreshToken })
      });
    } catch (error) {
      console.error('Failed to logout on server:', error);
    }
  }

  await signOut({ redirect: false });
  window.location.href = '/auth/login';
};

export const getCurrentUser = async () => {
  const session = await getSession();
  
  if (!session?.user) {
    throw new AuthError('Not authenticated', 401);
  }
  
  return {
    ...session.user,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken
  };
};