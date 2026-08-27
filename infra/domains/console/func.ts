import { rpc } from "@/lib/rpc-client"
import { apiUrl } from "@/lib/auth-client"
import type {
    createAppSchema,
    setAppActiveSchema,
    updateAppSchema,
} from "./types"
import type { z } from "zod"

export async function listApps() {
    const res = await rpc.api.console.apps.$get()
    if (!res.ok) throw new Error("Could not list apps")
    return await res.json()
}

export type AppListData = Awaited<ReturnType<typeof listApps>>
export type ListedApp = AppListData["applications"][number]

export async function findApp(clientId: string) {
    const res = await rpc.api.console.apps[":clientId"].$get({
        param: { clientId },
    })
    if (!res.ok) throw new Error("Could not load app")
    return await res.json()
}

export type AppDetail = Awaited<ReturnType<typeof findApp>>

export async function createApp(input: z.infer<typeof createAppSchema>) {
    const res = await rpc.api.console.apps.$post({ json: input })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || "Could not create app")
    }
    return await res.json()
}

export type CreatedApp = Awaited<ReturnType<typeof createApp>>

export async function updateApp(
    input: z.infer<typeof updateAppSchema>
): Promise<{ success: true }> {
    const { clientId, ...rest } = input
    const res = await fetch(`${apiUrl()}/api/console/apps/${clientId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
    })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || "Could not update app")
    }
    return await res.json()
}

export async function setAppActive(
    input: z.infer<typeof setAppActiveSchema>
): Promise<{ success: true }> {
    const res = await fetch(
        `${apiUrl()}/api/console/apps/${input.clientId}/active`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: input.active }),
        }
    )
    if (!res.ok) throw new Error("Could not update app")
    return await res.json()
}

export async function rotateApp(
    clientId: string
): Promise<{ clientSecret: string | null }> {
    const res = await rpc.api.console.apps[":clientId"]["rotate-secret"].$post(
        { param: { clientId } }
    )
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || "Could not rotate secret")
    }
    return await res.json()
}

export async function removeApp(
    clientId: string
): Promise<{ success: true }> {
    const res = await rpc.api.console.apps[":clientId"].$delete({
        param: { clientId },
    })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(body || "Could not remove app")
    }
    return await res.json()
}
