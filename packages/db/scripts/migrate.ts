import { nonNullable } from '@repo/utils'
import { config } from 'dotenv'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createClient } from '../client'


const args = process.argv.slice(2)
const envPath = args.length == 1 ? args[0] : undefined
config({ path: envPath ?? '../../.env', override: true })

async function migrate_database(): Promise<void> {
  const postgresUri = nonNullable(process.env.POSTGRES_URI, 'postgres uri')
  const db = createClient(postgresUri)
  await migrate(db, { migrationsFolder: 'drizzle-migrations' })
}

migrate_database()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
