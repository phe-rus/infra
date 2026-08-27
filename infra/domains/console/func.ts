import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { authClient } from "@/lib/auth-client"
import { AdminMiddleware } from "@/middleware"
import {
    appIdSchema,
    createAppSchema,
    PENDING_REDIRECT_URI,
    setAppActiveSchema,
    updateAppSchema,
} from "./types"
import type { OAuthClientRow } from "./types"

function headers() {
    return Object.fromEntries(Object.entries(getRequestHeaders()))
}

type OAuth2AdminClient = {
    createClient: (body: Record<string, unknown>) => Promise<{
        data: { client_id: string; client_secret?: string | null } | null
        error: { message?: string } | null
    }>
    updateClient: (
        body: Record<string, unknown>
    ) => Promise<{ data: unknown; error: { message?: string } | null }>
}
const oauth2Admin = (authClient.admin as unknown as { oauth2: OAuth2AdminClient })
    .oauth2

function toAppDetail(row: OAuthClientRow, callerId: string) {
    return {
        id: row.id,
        clientId: row.clientId,
        name: row.name,
        uri: row.uri,
        icon: row.icon,
        applicationType: row.applicationType,
        disabled: row.disabled,
        redirectUris: row.redirectUris ?? [],
        postLogoutRedirectUris: row.postLogoutRedirectUris ?? [],
        grantTypes: row.grantTypes ?? [],
        scopes: row.scopes ?? [],
        tokenEndpointAuthMethod: row.tokenEndpointAuthMethod,
        requirePKCE: row.requirePKCE,
        skipConsent: row.skipConsent,
        enableEndSession: row.enableEndSession,
        framework: row.metadata?.framework ?? null,
        isOwnClient: row.userId === null || row.userId === callerId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }
}

export type ListedApp = ReturnType<typeof toAppDetail>

export const listApps = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async (): Promise<{ applications: ListedApp[] }> => {
        throw new Error(
            "listApps is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
        )
    })

export type AppListData = Awaited<ReturnType<typeof listApps>>

export const findApp = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async (): Promise<ListedApp | null> => {
        throw new Error(
            "findApp is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
        )
    })

export type AppDetail = Awaited<ReturnType<typeof findApp>>

export const createApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createAppSchema)
    .handler(async ({ data }) => {
        const { data: client, error } = await oauth2Admin.createClient({
            client_name: data.client_name,
            client_uri: data.client_uri,
            logo_uri: data.logo_uri,
            application_type: data.application_type,
            token_endpoint_auth_method: data.token_endpoint_auth_method,
            redirect_uris: data.redirect_uris?.length
                ? data.redirect_uris
                : [PENDING_REDIRECT_URI],
            post_logout_redirect_uris: data.post_logout_redirect_uris,
            scope: data.scope.join(" "),
            grant_types: data.grant_types,
            require_pkce: data.require_pkce,
            skip_consent: data.skip_consent,
            enable_end_session: data.enable_end_session,
            ...(data.framework && { metadata: { framework: data.framework } }),
            fetchOptions: { headers: headers() },
        })
        if (error || !client) {
            throw new Error(error?.message ?? "Could not create app")
        }
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
        const { clientId, scope, framework, ...rest } = data
        const { error } = await oauth2Admin.updateClient({
            client_id: clientId,
            update: {
                ...rest,
                ...(scope && { scope: scope.join(" ") }),
                ...(framework && { metadata: { framework } }),
            },
            fetchOptions: { headers: headers() },
        })
        if (error) throw new Error(error.message ?? "Could not update app")
        return { success: true }
    })

export const setAppActive = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(setAppActiveSchema)
    .handler(async (): Promise<{ success: true }> => {
        throw new Error(
            "setAppActive is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
        )
    })

export const rotateApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async (): Promise<{ clientSecret: string | null }> => {
        throw new Error(
            "rotateApp is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
        )
    })

export const removeApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async (): Promise<{ success: true }> => {
        throw new Error(
            "removeApp is not yet available: it needs a dedicated api/ endpoint (was raw internalAdapter access, no client equivalent)"
        )
    })
