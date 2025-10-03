import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export function createClient(postgresUrl: string) {
  const client = postgres(postgresUrl)
  const db = drizzle(client)
  return db
}
