// // lib/providers.tsx
// 'use client';

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { SessionProvider } from 'next-auth/react';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       retry: (failureCount, error) => {
//         if (error instanceof Error && error.message.includes('401')) {
//           return false;
//         }
//         return failureCount < 3;
//       },
//     },
//   },
// });

// export function Providers({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <SessionProvider refetchInterval={5 * 60}>
//       <QueryClientProvider client={queryClient}>
//         {children}
//         {process.env.NODE_ENV === 'development' && (
//           <ReactQueryDevtools initialIsOpen={false} />
//         )}
//       </QueryClientProvider>
//     </SessionProvider>
//   );
// }
// lib/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export function Providers({
  children,
  session
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}