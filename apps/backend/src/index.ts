
import { Hono } from 'hono'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, type AppRouter } from '../../../packages/api/src/router'
import { createContext } from '@repo/api'
import { captureException, withSentry } from '@sentry/cloudflare'
import { HTTPException } from 'hono/http-exception'

const app = new Hono<{ Bindings: CloudflareEnv }>()

app.onError((err, c) => {
  captureException(err)
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  return c.json({ message: 'Internal Server Error' }, 500)
})

// Create the tRPC adapter using Hono's middleware
app.use('/api/trpc/*', async (c) => {
  const response = await fetchRequestHandler<AppRouter>({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, env: c.env }),
    onError: ({ error }) => {
      captureException(error)
      console.error('tRPC Error:', error);
    },
  });

  return response;
});

app.get('/', (c) => {
  return c.text('Hello from Hono!');
});

export default withSentry((env: CloudflareEnv) => {
  return {
    dsn: env.SENTRY_DSN_PUBLIC,
    sendDefaultPii: true
  }
}, app);
