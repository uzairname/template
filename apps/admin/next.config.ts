import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
}

export default withSentryConfig(nextConfig, {
  // Docs:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  org: 'u-qs',

  project: 'template-admin',

  silent: !process.env.CI,

  widenClientFileUpload: true,

  // // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // // This can increase your server load as well as your hosting bill.
  // // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
})

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
