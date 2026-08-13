import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { AdminMiddleware } from "@/kit/middleware"
import {
    appIdSchema,
    createAppSchema,
    PENDING_REDIRECT_URI,
    setAppActiveSchema,
    updateAppSchema,
} from "./schema"

// array-typed oauthClient columns (redirectUris, postLogoutRedirectUris,
// grantTypes, responseTypes, scopes) are stored as JSON text — the plugin's
// own endpoints deserialize these through schemaToOAuth, but a raw
// ctx.adapter.* call bypasses that entirely and hands back the column as
// stored (confirmed live), so every read here parses them itself
function parseJsonArray(value: string | null | undefined): string[] {
    if (!value) return []
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function parseFramework(metadata: string | null | undefined): string | null {
    if (!metadata) return null
    try {
        const parsed = JSON.parse(metadata)
        return typeof parsed?.framework === "string" ? parsed.framework : null
    } catch {
        return null
    }
}

type OAuthClientRow = {
    id: string
    clientId: string
    name: string | null
    uri: string | null
    icon: string | null
    type: string | null
    disabled: boolean | null
    redirectUris: string | null
    postLogoutRedirectUris: string | null
    grantTypes: string | null
    scopes: string | null
    tokenEndpointAuthMethod: string | null
    requirePKCE: boolean | null
    skipConsent: boolean | null
    enableEndSession: boolean | null
    metadata: string | null
    createdAt: Date
    updatedAt: Date
}

const APP_SELECT = [
    "id",
    "clientId",
    "name",
    "uri",
    "icon",
    "type",
    "disabled",
    "redirectUris",
    "postLogoutRedirectUris",
    "grantTypes",
    "scopes",
    "tokenEndpointAuthMethod",
    "requirePKCE",
    "skipConsent",
    "enableEndSession",
    "metadata",
    "createdAt",
    "updatedAt",
] as const

function toAppDetail(row: OAuthClientRow) {
    return {
        id: row.id,
        clientId: row.clientId,
        name: row.name,
        uri: row.uri,
        icon: row.icon,
        type: row.type,
        disabled: row.disabled,
        redirectUris: parseJsonArray(row.redirectUris),
        postLogoutRedirectUris: parseJsonArray(row.postLogoutRedirectUris),
        grantTypes: parseJsonArray(row.grantTypes),
        scopes: parseJsonArray(row.scopes),
        tokenEndpointAuthMethod: row.tokenEndpointAuthMethod,
        requirePKCE: row.requirePKCE,
        skipConsent: row.skipConsent,
        enableEndSession: row.enableEndSession,
        framework: parseFramework(row.metadata),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }
}

export const listApps = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const ctx = await auth.$context
        const clients = await ctx.adapter.findMany<OAuthClientRow>({
            model: "oauthClient",
            sortBy: { field: "createdAt", direction: "desc" },
            select: [...APP_SELECT],
        })
        return { applications: clients.map(toAppDetail) }
    })

export type AppListData = Awaited<ReturnType<typeof listApps>>
export type ListedApp = AppListData["applications"][number]

export const findApp = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async ({ data }) => {
        const ctx = await auth.$context
        const row = await ctx.adapter.findOne<OAuthClientRow>({
            model: "oauthClient",
            where: [{ field: "clientId", value: data.clientId }],
            select: [...APP_SELECT],
        })
        return row ? toAppDetail(row) : null
    })

export type AppDetail = Awaited<ReturnType<typeof findApp>>

export const createApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createAppSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const client = await auth.api.adminCreateOAuthClient({
            headers,
            body: {
                client_name: data.client_name,
                client_uri: data.client_uri,
                logo_uri: data.logo_uri,
                type: data.type,
                token_endpoint_auth_method: data.token_endpoint_auth_method,
                redirect_uris: data.redirect_uris?.length ? data.redirect_uris : [PENDING_REDIRECT_URI],
                post_logout_redirect_uris: data.post_logout_redirect_uris,
                scope: data.scope.join(" "),
                grant_types: data.grant_types,
                require_pkce: data.require_pkce,
                skip_consent: data.skip_consent,
                enable_end_session: data.enable_end_session,
                ...(data.framework && { metadata: { framework: data.framework } }),
            },
        })
        return {
            clientId: client.client_id,
            clientSecret: client.client_secret ?? null,
        }
    })

export type CreatedApp = Awaited<ReturnType<typeof createApp>>

export const updateApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(updateAppSchema)
    .handler(async ({ data }): Promise<{ success: true }> => {
        const headers = getRequestHeaders()
        const { clientId, scope, framework, ...rest } = data
        await auth.api.adminUpdateOAuthClient({
            headers,
            body: {
                client_id: clientId,
                update: {
                    ...rest,
                    ...(scope && { scope: scope.join(" ") }),
                    ...(framework && { metadata: { framework } }),
                },
            },
        })
        return { success: true }
    })

export const setAppActive = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(setAppActiveSchema)
    .handler(async ({ data }): Promise<{ success: true }> => {
        const ctx = await auth.$context
        await ctx.adapter.update({
            model: "oauthClient",
            where: [{ field: "clientId", value: data.clientId }],
            update: { disabled: !data.active },
        })
        return { success: true }
    })

export const rotateApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async ({ data }): Promise<{ clientSecret: string | null }> => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.rotateClientSecret({
            headers,
            returnHeaders: true,
            body: { client_id: data.clientId },
        })
        forwardAuthHeaders(responseHeaders)
        return { clientSecret: response.client_secret ?? null }
    })

export const removeApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async ({ data }): Promise<{ success: true }> => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders } = await auth.api.deleteOAuthClient({
            headers,
            returnHeaders: true,
            body: { client_id: data.clientId },
        })
        forwardAuthHeaders(responseHeaders)
        return { success: true }
    })
