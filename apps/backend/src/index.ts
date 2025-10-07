import { createContext } from '@repo/api'
import { addBreadcrumb, captureException, captureMessage, withSentry } from '@sentry/cloudflare'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { appRouter, type AppRouter } from '../../../packages/api/src/router'

const app = new Hono<{ Bindings: CloudflareEnv }>()

// CORS middleware - allow credentials from admin app
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://admin.uzairname.org',
        'https://uzairname.org',
      ]
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Middleware to log every request to Sentry
app.use('*', async (c, next) => {
  const startTime = Date.now()
  const method = c.req.method
  const url = c.req.url
  const path = new URL(url).pathname

  // Add breadcrumb for the request
  addBreadcrumb({
    category: 'http',
    message: `Received request: ${method} ${path}`,
    level: 'info',
    data: {
      url,
      method,
    },
  })

  await next()

  const duration = Date.now() - startTime
  const status = c.res.status

  // Capture a message for every request with all breadcrumbs
  captureMessage(`${method} ${path} - ${status}`, {
    level: status >= 500 ? 'error' : 'info',
    tags: {
      method,
      path,
      status: status.toString(),
    },
    extra: {
      url,
      duration,
      status,
    },
  })
})

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
      console.error('tRPC Error:', error)
    },
  })

  return response
})

app.get('/', (c) => {
  return c.text('Hello from Hono!')
})

export default withSentry((env: CloudflareEnv) => {
  return {
    dsn: env.SENTRY_DSN_PUBLIC,
    sendDefaultPii: true,
    environment: env.ENVIRONMENT,
  }
}, app)
