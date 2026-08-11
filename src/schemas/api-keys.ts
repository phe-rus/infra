import { z } from "zod"

export const keyIdSchema = z.object({ keyId: z.string().min(1) })

export const createApiKeySchema = z.object({
    name: z.string().min(1),
    expiresIn: z.number().positive().nullable(),
})

export const setApiKeyEnabledSchema = z.object({
    keyId: z.string().min(1),
    enabled: z.boolean(),
})
