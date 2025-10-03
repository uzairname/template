import { integer, pgTable, uuid } from 'drizzle-orm/pg-core'
import { UserRole } from '../models/user'
import { supabaseUsers } from './auth'

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .references(() => supabaseUsers.id, { onDelete: 'cascade' }),
  role: integer('role').notNull().$type<UserRole>().default(UserRole.User),
}).enableRLS()
