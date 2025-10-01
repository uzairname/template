import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { router, adminProcedure, rootProcedure } from '../trpc'
import { users } from '@repo/db/schema'
import { UserRole } from '@repo/db'

/**
 * User admin router - requires admin privileges
 */
export const userAdminRouter = router({
  // Set a user's role to admin (root access required)
  setUserRole: rootProcedure
    .input(z.object({
      userId: z.uuid('Invalid user ID format'),
      role: z.enum(UserRole)
    }))
    .mutation(async ({ input, ctx }) => {
      const { userId, role } = input

      try {
        // Check if the target user exists
        const [targetUser] = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)

        if (!targetUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        // Update the user's role (no self-demotion check needed for root access)
        const [updatedUser] = await ctx.db
          .update(users)
          .set({ role })
          .where(eq(users.id, userId))
          .returning()

        if (!updatedUser) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update user role',
          })
        }

        return {
          success: true,
          message: `User role updated to ${role === UserRole.Admin ? 'Admin' : 'User'}`,
          user: {
            id: updatedUser.id,
            role: updatedUser.role,
          }
        }

      } catch (error) {
        // Re-throw TRPCErrors as-is
        if (error instanceof TRPCError) {
          throw error
        }

        // Log unexpected errors and throw a generic error
        console.error('Error updating user role:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating user role',
        })
      }
    }),

  // Get all users (admin-only endpoint for user management)
  getAllUsers: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional().default(() => ({ limit: 50, offset: 0 })))
    .query(async ({ input, ctx }) => {
      const { limit, offset } = input

      try {
        const allUsers = await ctx.db
          .select({
            id: users.id,
            role: users.role,
          })
          .from(users)
          .limit(limit)
          .offset(offset)
          .orderBy(users.role) // Show admins first

        return {
          users: allUsers.map(user => ({
            id: user.id,
            role: user.role,
            roleLabel: user.role === UserRole.Admin ? 'Admin' : 'User'
          })),
          pagination: {
            limit,
            offset,
            total: allUsers.length
          }
        }

      } catch (error) {
        console.error('Error fetching users:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }
    }),
})