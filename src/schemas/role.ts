import { z } from "zod"

export const customRoleSchema = z.object({
    name: z.string().min(1),
    permissions: z.object({
        user: z.array(z.string()),
        session: z.array(z.string()),
    }),
    adminTier: z.boolean(),
})
