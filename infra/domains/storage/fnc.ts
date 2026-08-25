import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/middleware"
import { deleteObjectsSchema, listPrefixSchema } from "./schema"

export const listObjects = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(listPrefixSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.listObjects({
            headers,
            query: { prefix: data.prefix },
        })
    })

export type ObjectsListResult = Awaited<ReturnType<typeof listObjects>>

export const deleteObjects = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(deleteObjectsSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.deleteObjects({
            headers,
            body: { keys: data.keys, prefix: data.prefix },
        })
    })
