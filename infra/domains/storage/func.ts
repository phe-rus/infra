import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { rpc } from "@/lib/rpc-client"
import { AdminMiddleware } from "@/middleware"
import { deleteObjectsSchema, listPrefixSchema } from "./types"

export const listObjects = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(listPrefixSchema)
    .handler(async ({ data }) => {
        const headers = Object.fromEntries(Object.entries(getRequestHeaders()))
        const res = await rpc.api.assets.list.$get(
            { query: { prefix: data.prefix ?? "" } },
            { headers }
        )
        if (!res.ok) throw new Error("Could not list objects")
        return await res.json()
    })

export type ObjectsListResult = Awaited<ReturnType<typeof listObjects>>

export const deleteObjects = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(deleteObjectsSchema)
    .handler(async ({ data }) => {
        const headers = Object.fromEntries(Object.entries(getRequestHeaders()))
        const res = await rpc.api.assets.delete.$post(
            { json: { keys: data.keys, prefix: data.prefix } },
            { headers }
        )
        if (!res.ok) throw new Error("Could not delete objects")
        return await res.json()
    })
