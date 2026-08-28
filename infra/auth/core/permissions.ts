import type { BetterAuthOptions } from "better-auth/types"

type OptionsProps = Partial<BetterAuthOptions>
export const FIXED_ROLE_NAMES = ["admin", "user"] as const
export function isAdminTier(role: string): boolean {
    return role === "admin"
}

async function markUserActive(userId: string, ctx: {
    context: {
        internalAdapter: {
            updateUser: (
                id: string,
                data: Record<string, unknown>
            ) => Promise<unknown>
        }
    }
}) {
    await ctx.context.internalAdapter.updateUser(userId, {
        lastActiveAt: new Date(),
    })
}

export const databaseHooks = {
    user: {
        create: {
            before: async (user, ctx) => {
                if (ctx?.path !== "/sign-up/email") {
                    return {
                        data: user,
                    }
                }
                const adapter = ctx.context.adapter
                const count = await adapter.count({ model: "user" })
                return {
                    data: {
                        ...user,
                        role: count > 0 ? "user" : "admin",
                    },
                }
            },
        },
    },
    session: {
        create: {
            after: async (session, ctx) => {
                if (!ctx) return
                await markUserActive(session.userId, ctx)
            },
        },
        update: {
            after: async (session, ctx) => {
                if (!ctx) return
                await markUserActive(session.userId, ctx)
            },
        },
    },
} satisfies OptionsProps["databaseHooks"]
