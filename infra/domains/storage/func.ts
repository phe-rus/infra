import { createServerFn } from "@tanstack/react-start"
import { env } from "cloudflare:workers"
import { listAllObjects } from "@infra/r2/server"
import { AdminMiddleware } from "@/middleware"
import { deleteObjectsSchema, listPrefixSchema } from "./types"

export const listObjects = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(listPrefixSchema)
    .handler(async ({ data }) => {
        const prefix = data.prefix ?? ""
        const result = await env.R2.list({
            prefix,
            delimiter: "/",
            include: ["httpMetadata"],
        })
        return {
            prefix,
            folders: result.delimitedPrefixes.map((folder) => ({
                key: folder,
                name: folder.slice(prefix.length).replace(/\/$/, ""),
            })),
            files: result.objects.map((obj) => ({
                key: obj.key,
                name: obj.key.slice(prefix.length),
                size: obj.size,
                uploadedAt: obj.uploaded,
                contentType: obj.httpMetadata?.contentType ?? null,
            })),
        }
    })

export type ObjectsListResult = Awaited<ReturnType<typeof listObjects>>

export const deleteObjects = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(deleteObjectsSchema)
    .handler(async ({ data }) => {
        if (!data.keys?.length && !data.prefix) {
            throw new Error("Provide keys or prefix")
        }
        const targetKeys = data.prefix
            ? (await listAllObjects(env.R2, data.prefix)).map(
                  (obj) => obj.key
              )
            : (data.keys ?? [])
        for (let i = 0; i < targetKeys.length; i += 1000) {
            await env.R2.delete(targetKeys.slice(i, i + 1000))
        }
        return { success: true, deleted: targetKeys.length }
    })
