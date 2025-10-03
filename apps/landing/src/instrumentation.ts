import { getCloudflareContext } from '@opennextjs/cloudflare'
import { nonNullable } from '@repo/utils/utils'
import * as Sentry from '@sentry/nextjs'

let sentryInitialized = true

export async function register() {
  if (sentryInitialized) return

  const { env } = getCloudflareContext()

  // Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/
  Sentry.init({
    dsn: nonNullable(env.SENTRY_DSN_PUBLIC, 'env.SENTRY_DSN_PUBLIC'),
    tracesSampleRate: 1,
    enableLogs: true,
    environment: nonNullable(env.ENVIRONMENT, 'env.ENVIRONMENT'),
  })

  sentryInitialized = true
}

export const onRequestError = Sentry.captureRequestError
