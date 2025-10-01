import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { supabaseUsers } from "./auth";
import { UserRole } from "../models/user";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().references(() => supabaseUsers.id),
  role: integer('role').notNull().$type<UserRole>().default(UserRole.User),
});
