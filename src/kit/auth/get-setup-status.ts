import { createServerFn } from "@tanstack/react-start"
import { auth } from "@/auth"

export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
    try {
        const ctx = await auth.$context
        const count = await ctx.adapter.count({ model: "user" })
        return { hasOwner: count > 0 }
    } catch {
        return { hasOwner: false }
    }
})
