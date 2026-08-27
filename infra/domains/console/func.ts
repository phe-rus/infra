import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { db } from "@/db"
import { oauthClient } from "@/schemas/auth"
import { AdminMiddleware } from "@/middleware"
import { assertOwnsApp } from "./assert-owns-app"
import {
    appIdSchema,
    createAppSchema,
    PENDING_REDIRECT_URI,
    setAppActiveSchema,
    updateAppSchema,
} from "./types"

type OAuthClientRow = typeof oauthClient.$inferSelect

function toAppDetail(row: OAuthClientRow, callerId: string) {
    return {
        id: row.id,
        clientId: row.clientId,
        name: row.name,
        uri: row.uri,
        icon: row.icon,
        applicationType: row.applicationType,
        disabled: row.disabled,
        redirectUris: (row.redirectUris as string[] | null) ?? [],
        postLogoutRedirectUris:
            (row.postLogoutRedirectUris as string[] | null) ?? [],
        grantTypes: (row.grantTypes as string[] | null) ?? [],
        scopes: (row.scopes as string[] | null) ?? [],
        tokenEndpointAuthMethod: row.tokenEndpointAuthMethod,
        requirePKCE: row.requirePKCE,
        skipConsent: row.skipConsent,
        enableEndSession: row.enableEndSession,
        framework:
            (row.metadata as { framework?: string } | null)?.framework ??
            null,
        isOwnClient: row.userId === null || row.userId === callerId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }
}

export type ListedApp = ReturnType<typeof toAppDetail>

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

const SECRET_CHARS =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

function generateSecret(length: number): string {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => SECRET_CHARS[b % SECRET_CHARS.length]).join(
        ""
    )
}

async function hashClientSecret(secret: string): Promise<string> {
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(secret)
    )
    let binary = ""
    for (const b of new Uint8Array(digest)) binary += String.fromCharCode(b)
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export const listApps = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async ({ context: { sessions } }) => {
        const rows = await db
            .select()
            .from(oauthClient)
            .orderBy(desc(oauthClient.createdAt))
        return {
            applications: rows.map((row) =>
                toAppDetail(row, sessions.user.id)
            ),
        }
    })

export type AppListData = Awaited<ReturnType<typeof listApps>>

export const findApp = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(async ({ data, context: { sessions } }) => {
        const [row] = await db
            .select()
            .from(oauthClient)
            .where(eq(oauthClient.clientId, data.clientId))
        return row ? toAppDetail(row, sessions.user.id) : null
    })

export type AppDetail = Awaited<ReturnType<typeof findApp>>

export const createApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createAppSchema)
    .handler(async ({ data }) => {
        try {
            const client = await auth.api.adminCreateOAuthClient({
                body: {
                    client_name: data.client_name,
                    client_uri: data.client_uri,
                    logo_uri: data.logo_uri,
                    application_type: data.application_type,
                    token_endpoint_auth_method:
                        data.token_endpoint_auth_method,
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
                        metadata: { framework: data.framework },
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
        const { clientId, scope, framework, ...rest } = data
        try {
            await auth.api.adminUpdateOAuthClient({
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
        await db
            .update(oauthClient)
            .set({ disabled: !data.active })
            .where(eq(oauthClient.clientId, data.clientId))
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
            const [client] = await db
                .select({
                    clientSecret: oauthClient.clientSecret,
                    tokenEndpointAuthMethod:
                        oauthClient.tokenEndpointAuthMethod,
                    userId: oauthClient.userId,
                })
                .from(oauthClient)
                .where(eq(oauthClient.clientId, data.clientId))
            if (!client) {
                throw new Error("Application not found")
            }
            assertOwnsApp(client.userId, sessions.user.id, "rotate its secret")
            if (
                !client.clientSecret ||
                client.tokenEndpointAuthMethod === "none"
            ) {
                throw new Error("Public clients cannot be rotated")
            }
            const clientSecret = generateSecret(32)
            await db
                .update(oauthClient)
                .set({
                    clientSecret: await hashClientSecret(clientSecret),
                    updatedAt: new Date(),
                })
                .where(eq(oauthClient.clientId, data.clientId))
            return { clientSecret }
        }
    )

export const removeApp = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(appIdSchema)
    .handler(
        async ({ data, context: { sessions } }): Promise<{ success: true }> => {
            const [client] = await db
                .select({ userId: oauthClient.userId })
                .from(oauthClient)
                .where(eq(oauthClient.clientId, data.clientId))
            if (!client) {
                throw new Error("Application not found")
            }
            assertOwnsApp(client.userId, sessions.user.id, "remove it")
            await db
                .delete(oauthClient)
                .where(eq(oauthClient.clientId, data.clientId))
            return { success: true }
        }
    )
