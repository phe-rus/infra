import type { BetterAuthOptions } from "better-auth/types"

type OptionsProps = Partial<BetterAuthOptions>

export const FIXED_ROLE_NAMES = ["admin", "user"] as const

export function isAdminTier(role: string): boolean {
    return role === "admin"
}

// the first account ever created on a fresh instance becomes "admin",
// everyone after becomes "user" — same bootstrap every pherus product needs
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
} satisfies OptionsProps["databaseHooks"]
