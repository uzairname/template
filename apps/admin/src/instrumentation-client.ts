import * as Sentry from '@sentry/nextjs'

// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  enableLogs: true,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
