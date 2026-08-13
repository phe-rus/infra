import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/kit/middleware"
import { deleteFolderSchema, deleteObjectSchema } from "@/kit/schemas"
import * as z from "zod"

const browsePrefixSchema = z.object({ prefix: z.string().optional() })

export const browseObjects = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(browsePrefixSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.browseObjects({ headers, query: { prefix: data.prefix } })
    })

export const deleteObject = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(deleteObjectSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.deleteObject({ headers, body: { key: data.key } })
    })

export const deleteFolder = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(deleteFolderSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.deleteFolder({ headers, body: { prefix: data.prefix } })
    })
