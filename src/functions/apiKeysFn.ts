import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { queryOptions } from "@tanstack/react-query"
import { auth } from "@/auth"
import { AuthMiddleware } from "./protectionFn"
import { z } from "zod"

export const listApiKeysFn = createServerFn({ method: "GET" })
    .middleware([AuthMiddleware])
    .handler(async ({ context: { sessions } }) => {
        if (!sessions) throw new Error("Not signed in")
        const headers = getRequestHeaders()
        const { apiKeys } = await auth.api.listApiKeys({ headers })
        return apiKeys
    })

export type ApiKey = Awaited<ReturnType<typeof listApiKeysFn>>[number]

export const apiKeysQueryOptions = () =>
    queryOptions({
        queryKey: ["apiKeys"],
        queryFn: () => listApiKeysFn(),
    })

const createApiKeySchema = z.object({
    name: z.string().min(1),
    expiresIn: z.number().positive().nullable(),
})

export const createApiKeyFn = createServerFn({ method: "POST" })
    .middleware([AuthMiddleware])
    .validator(createApiKeySchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (!sessions) throw new Error("Not signed in")
        const headers = getRequestHeaders()
        return await auth.api.createApiKey({
            headers,
            body: { name: data.name, expiresIn: data.expiresIn },
        })
    })

const keyIdSchema = z.object({ keyId: z.string().min(1) })

export const deleteApiKeyFn = createServerFn({ method: "POST" })
    .middleware([AuthMiddleware])
    .validator(keyIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (!sessions) throw new Error("Not signed in")
        const headers = getRequestHeaders()
        return await auth.api.deleteApiKey({
            headers,
            body: { keyId: data.keyId },
        })
    })

const setApiKeyEnabledSchema = z.object({
    keyId: z.string().min(1),
    enabled: z.boolean(),
})

export const setApiKeyEnabledFn = createServerFn({ method: "POST" })
    .middleware([AuthMiddleware])
    .validator(setApiKeyEnabledSchema)
    .handler(async ({ data, context: { sessions } }) => {
        if (!sessions) throw new Error("Not signed in")
        const headers = getRequestHeaders()
        return await auth.api.updateApiKey({
            headers,
            body: { keyId: data.keyId, enabled: data.enabled },
        })
    })
