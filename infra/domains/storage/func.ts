import { rpc } from "@/lib/rpc-client"
import type { deleteObjectsSchema } from "./types"
import type { z } from "zod"

export async function listObjects(prefix: string) {
    const res = await rpc.api.assets.list.$get({ query: { prefix } })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`Could not list objects (${res.status}): ${body}`)
    }
    return await res.json()
}

export type ObjectsListResult = Awaited<ReturnType<typeof listObjects>>

export async function deleteObjects(
    input: z.infer<typeof deleteObjectsSchema>
) {
    const res = await rpc.api.assets.delete.$post({
        json: { keys: input.keys, prefix: input.prefix },
    })
    if (!res.ok) throw new Error("Could not delete objects")
    return await res.json()
}
