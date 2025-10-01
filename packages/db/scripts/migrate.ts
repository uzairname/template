import { config } from 'dotenv'
import { nonNullable } from '@repo/utils'
import { createClient } from '../client'
import { migrate } from 'drizzle-orm/node-postgres/migrator'


async function migrate_database(postgres_url: string): Promise<void> {
  console.log('migrating')

  const db = createClient(postgres_url)

  await migrate(db, { migrationsFolder: 'drizzle-migrations' })

  console.log('done migrating')
}



const args = process.argv.slice(2)
const envPath = args.length == 1 ? args[0] : undefined
config({ path: envPath ?? '../../.env', override: true })

const postgresUri = nonNullable(process.env.POSTGRES_URI, 'postgres uri')

migrate_database(postgresUri)
  .then(() => {
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })