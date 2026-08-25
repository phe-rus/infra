import type { BetterAuthOptions } from "better-auth/types"

type OptionsProps = Partial<BetterAuthOptions>

// the first account ever created on a fresh instance becomes "owner",
// everyone after becomes "user" — same bootstrap every pherus product needs
export const databaseHooks = {
    user: {
        create: {
            before: async (user, ctx) => {
                if (ctx?.path !== "/sign-up/email") return { data: user }
                const adapter = ctx.context.adapter
                const count = await adapter.count({ model: "user" })
                return {
                    data: {
                        ...user,
                        role: count > 0 ? "user" : "owner",
                    },
                }
            },
        },
    },
} satisfies OptionsProps["databaseHooks"]
