import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/middleware"
import { APIError } from "better-auth/api"
import { createHash } from "@better-auth/utils/hash"
import { base64Url } from "@better-auth/utils/base64"
import { createRandomStringGenerator } from "@better-auth/utils/random"
import { assertOwnsApp } from "./assert-owns-app"
import {
    appIdSchema,
    createAppSchema,
    PENDING_REDIRECT_URI,
    setAppActiveSchema,
    updateAppSchema,
    APP_SELECT,
} from "./types"
import type { OAuthClientRow } from "./types"

const generateSecret = createRandomStringGenerator("a-z", "A-Z")
function withClientMetadataError(error: unknown): never {
    if (
        error instanceof APIError &&
        !error.message &&
        error.body &&
        typeof error.body === "object" &&
        "error_description" in error.body
    ) {
        throw new APIError(error.status, {
            message: String(error.body.error_description),
        })
    }
    throw error
}

async function hashClientSecret(secret: string): Promise<string> {
    const digest = await createHash("SHA-256").digest(
        new TextEncoder().encode(secret)
    )
    return base64Url.encode(new Uint8Array(digest), { padding: false })
}

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

export const listApps = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async ({ context: { sessions } }) => {
        const ctx = await auth.$context
        const clients = await ctx.adapter.findMany<OAuthClientRow>({
            model: "oauthClient",
            sortBy: { field: "createdAt", direction: "desc" },
            select: [...APP_SELECT],
        })
        return {
            applications: clients.map((row) =>
                toAppDetail(row, sessions.user.id)
            ),
        }
    })

export type AppListData = Awaited<ReturnType<typeof listApps>>
export type ListedApp = AppListData["applications"][number]

export const findApp = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        const ctx = await auth.$context
        const row = await ctx.adapter.findOne<OAuthClientRow>({
            model: "oauthClient",
            where: [{ field: "clientId", value: data.clientId }],
            select: [...APP_SELECT],
        })
        return row ? toAppDetail(row, sessions.user.id) : null
    })

export type AppDetail = Awaited<ReturnType<typeof findApp>>

export const createApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createAppSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        try {
            const client = await auth.api.adminCreateOAuthClient({
                headers: headers,
                body: {
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
                    ...(data.framework && {
                        metadata: {
                            framework: data.framework,
                        },
                    }),
                },
            })
            return {
                clientId: client.client_id,
                clientSecret: client.client_secret ?? null,
            }
        } catch (error) {
            withClientMetadataError(error)
        }
    })

export type CreatedApp = Awaited<ReturnType<typeof createApp>>

export const updateApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(updateAppSchema)
    .handler(async ({ data }): Promise<{ success: true }> => {
        const headers = getRequestHeaders()
        const { clientId, scope, framework, ...rest } = data
        try {
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
        } catch (error) {
            withClientMetadataError(error)
        }
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
    .handler(
        async ({
            data,
            context: { sessions },
        }): Promise<{ clientSecret: string | null }> => {
            const ctx = await auth.$context
            const client = await ctx.adapter.findOne<{
                clientSecret: string | null
                tokenEndpointAuthMethod: string | null
                userId: string | null
            }>({
                model: "oauthClient",
                where: [{ field: "clientId", value: data.clientId }],
                select: ["clientSecret", "tokenEndpointAuthMethod", "userId"],
            })
            if (!client) {
                throw new APIError("NOT_FOUND", {
                    message: "Application not found",
                })
            }
            assertOwnsApp(client.userId, sessions.user.id, "rotate its secret")
            if (
                !client.clientSecret ||
                client.tokenEndpointAuthMethod === "none"
            ) {
                throw new APIError("BAD_REQUEST", {
                    message: "Public clients cannot be rotated",
                })
            }
            const clientSecret = generateSecret(32)
            await ctx.adapter.update({
                model: "oauthClient",
                where: [{ field: "clientId", value: data.clientId }],
                update: {
                    clientSecret: await hashClientSecret(clientSecret),
                    updatedAt: new Date(),
                },
            })
            return { clientSecret }
        }
    )

export const removeApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(
        async ({ data, context: { sessions } }): Promise<{ success: true }> => {
            const ctx = await auth.$context
            const client = await ctx.adapter.findOne<{ userId: string | null }>(
                {
                    model: "oauthClient",
                    where: [{ field: "clientId", value: data.clientId }],
                    select: ["userId"],
                }
            )
            if (!client) {
                throw new APIError("NOT_FOUND", {
                    message: "Application not found",
                })
            }
            assertOwnsApp(client.userId, sessions.user.id, "remove it")
            await ctx.adapter.delete({
                model: "oauthClient",
                where: [{ field: "clientId", value: data.clientId }],
            })
            return { success: true }
        }
    )
