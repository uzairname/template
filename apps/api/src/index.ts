
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, type AppRouter, createContext } from '@repo/api'


// Initialize Hono app
const app = new Hono();

// 3. Create the tRPC adapter using Hono's middleware
app.use('/api/trpc/*', async (c) => {
  const response = await fetchRequestHandler<AppRouter>({
    endpoint: '/api/trpc',
    req: c.req.raw, // Pass the raw Request object from Hono's context
    router: appRouter,
    createContext, // Pass the context creation function
    onError: ({ error }) => {
      console.error('tRPC Error:', error);
    },
  });

  // The fetchRequestHandler returns a standard Response object
  return response;
});

// You can still define other non-tRPC routes
app.get('/', (c) => {
  return c.text('Hello from Hono!');
});

// Export the Hono app to be used by the Cloudflare Worker runtime
export default app;