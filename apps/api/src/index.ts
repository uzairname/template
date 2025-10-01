
import { Hono } from 'hono'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, type AppRouter } from './router'
import { createContext } from './trpc'

const app = new Hono<{ Bindings: CloudflareEnv }>()

// Create the tRPC adapter using Hono's middleware
app.use('/api/trpc/*', async (c) => {
  const response = await fetchRequestHandler<AppRouter>({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, env: c.env }),
    onError: ({ error }) => {
      console.error('tRPC Error:', error);
    },
  });

  return response;
});

app.get('/', (c) => {
  return c.text('Hello from Hono!');
});

export default app;
