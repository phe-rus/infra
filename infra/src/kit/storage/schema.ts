import { z } from "zod"

export const listPrefixSchema = z.object({ prefix: z.string().optional() })

// single file, multiple files, or a whole folder — one endpoint, one schema
export const deleteObjectsSchema = z
    .object({
        keys: z.array(z.string().min(1)).optional(),
        prefix: z.string().min(1).optional(),
    })
    .refine((data) => (data.keys && data.keys.length > 0) || data.prefix, {
        message: "Provide keys or prefix",
    })
