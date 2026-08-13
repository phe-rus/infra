import { z } from "zod"

export const browsePrefixSchema = z.object({ prefix: z.string().optional() })

export const deleteObjectSchema = z.object({ key: z.string().min(1) })

export const deleteFolderSchema = z.object({ prefix: z.string().min(1) })
