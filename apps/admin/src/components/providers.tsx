'use client'

import { trpc } from '@/utils/trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  // Get backend URL from Cloudflare runtime env (production) or fallback to local dev
  const getBackendUrl = () => {
    try {
      const { getCloudflareContext } = require('@opennextjs/cloudflare')
      const { env } = getCloudflareContext()
      console.log('[tRPC] Using backend URL from CloudflareEnv:', env.BACKEND_BASE_URL)
      return env.BACKEND_BASE_URL
    } catch {
      // In development or when Cloudflare context is not available
      const fallbackUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8989'
      console.log('[tRPC] Using fallback backend URL:', fallbackUrl)
      return fallbackUrl
    }
  }

  const [trpcClient] = React.useState(() => {
    const backendUrl = getBackendUrl()
    const fullUrl = `${backendUrl}/api/trpc`
    console.log('[tRPC] Creating tRPC client with URL:', fullUrl)

    return trpc.createClient({
      links: [
        httpBatchLink({
          url: fullUrl,
          // Important: Include credentials (cookies) in every request
          fetch(url, options) {
            console.log('[tRPC] Outgoing request:', {
              url,
              method: options?.method,
              credentials: 'include',
              headers: options?.headers,
            })

            return fetch(url, {
              ...options,
              credentials: 'include',
            }).then((response) => {
              console.log('[tRPC] Response received:', {
                url,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
              })
              return response
            }).catch((error) => {
              console.error('[tRPC] Request failed:', {
                url,
                error: error.message,
              })
              throw error
            })
          },
        }),
      ],
    })
  })

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TRPCProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </TRPCProvider>
  )
}
