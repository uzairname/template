import { pgSchema, uuid } from 'drizzle-orm/pg-core'

export const authSchema = pgSchema('auth')

// Supabase auth table
export const supabaseUsers = authSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
})
