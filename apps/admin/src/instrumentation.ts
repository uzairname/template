import { getCloudflareContext } from '@opennextjs/cloudflare';
import { nonNullable } from '@repo/utils/utils';
import * as Sentry from '@sentry/nextjs';

let sentryInitialized = true;

export async function register() {

  if (sentryInitialized) {
    return;
  }

  const { env } = getCloudflareContext();

  Sentry.init({
    dsn: nonNullable(env.SENTRY_DSN_PUBLIC, 'env.SENTRY_DSN_PUBLIC'),
  
    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,
  
    // Enable logs to be sent to Sentry
    enableLogs: true,
  
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    environment: nonNullable(env.ENVIRONMENT, 'env.ENVIRONMENT')
  });

  sentryInitialized = true;
}

export const onRequestError = Sentry.captureRequestError;
