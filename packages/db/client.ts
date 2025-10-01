import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

export function createClient(postgresUrl: string){
  const client = postgres(postgresUrl)
  const db = drizzle(client)
  return db
}
