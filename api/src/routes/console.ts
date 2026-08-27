import { desc, eq } from "drizzle-orm"
import * as z from "zod"
import { auth } from "../auth/auth"
import { db } from "../db"
import { oauthClient } from "../schemas/auth"
import defineHandler from "../utils/defineHandler"
import { protectedSession, adminSession } from "../middleware/permissions"

const PENDING_REDIRECT_URI = "http://127.0.0.1/pending"

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

function withClientMetadataError(error: unknown): never {
    if (
        error &&
        typeof error === "object" &&
        "body" in error &&
        error.body &&
        typeof error.body === "object" &&
        "error_description" in error.body
    ) {
        throw new Error(
            String(
                (error.body as { error_description: unknown })
                    .error_description
            )
        )
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

const createAppBody = z.object({
    client_name: z.string().min(1),
    client_uri: z.string().optional(),
    logo_uri: z.string().optional(),
    framework: z.string().optional(),
    application_type: z.enum(["web", "native"]),
    token_endpoint_auth_method: z.enum([
        "none",
        "client_secret_basic",
        "client_secret_post",
    ]),
    redirect_uris: z.array(z.string()).optional(),
    post_logout_redirect_uris: z.array(z.string()).optional(),
    scope: z.array(z.string()),
    grant_types: z.array(z.string()),
    require_pkce: z.boolean(),
    skip_consent: z.boolean(),
    enable_end_session: z.boolean(),
})

const updateAppBody = z.object({
    client_name: z.string().min(1).optional(),
    client_uri: z.string().optional(),
    logo_uri: z.string().optional(),
    framework: z.string().optional(),
    redirect_uris: z.array(z.string()).min(1).optional(),
    post_logout_redirect_uris: z.array(z.string()).min(1).optional(),
    scope: z.array(z.string()).optional(),
    grant_types: z.array(z.string()).optional(),
    skip_consent: z.boolean().optional(),
    enable_end_session: z.boolean().optional(),
})

export const consoleRoute = defineHandler()
    .get("/apps", protectedSession, adminSession, async (c) => {
        const user = c.get("user")!
        const rows = await db
            .select()
            .from(oauthClient)
            .orderBy(desc(oauthClient.createdAt))
        return c.json({
            applications: rows.map((row) => toAppDetail(row, user.id)),
        })
    })
    .get("/apps/:clientId", protectedSession, adminSession, async (c) => {
        const user = c.get("user")!
        const clientId = c.req.param("clientId")
        const [row] = await db
            .select()
            .from(oauthClient)
            .where(eq(oauthClient.clientId, clientId))
        return c.json(row ? toAppDetail(row, user.id) : null)
    })
    .post("/apps", protectedSession, adminSession, async (c) => {
        const body = createAppBody.parse(await c.req.json())
        try {
            const client = await auth.api.adminCreateOAuthClient({
                body: {
                    client_name: body.client_name,
                    client_uri: body.client_uri,
                    logo_uri: body.logo_uri,
                    application_type: body.application_type,
                    token_endpoint_auth_method:
                        body.token_endpoint_auth_method,
                    redirect_uris: body.redirect_uris?.length
                        ? body.redirect_uris
                        : [PENDING_REDIRECT_URI],
                    post_logout_redirect_uris:
                        body.post_logout_redirect_uris,
                    scope: body.scope.join(" "),
                    grant_types: body.grant_types,
                    require_pkce: body.require_pkce,
                    skip_consent: body.skip_consent,
                    enable_end_session: body.enable_end_session,
                    ...(body.framework && {
                        metadata: { framework: body.framework },
                    }),
                },
            })
            return c.json({
                clientId: client.client_id,
                clientSecret: client.client_secret ?? null,
            })
        } catch (error) {
            withClientMetadataError(error)
        }
    })
    .patch("/apps/:clientId", protectedSession, adminSession, async (c) => {
        const clientId = c.req.param("clientId")
        const body = updateAppBody.parse(await c.req.json())
        const { scope, framework, ...rest } = body
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
            return c.json({ success: true })
        } catch (error) {
            withClientMetadataError(error)
        }
    })
    .post(
        "/apps/:clientId/active",
        protectedSession,
        adminSession,
        async (c) => {
            const clientId = c.req.param("clientId")
            const { active } = z
                .object({ active: z.boolean() })
                .parse(await c.req.json())
            await db
                .update(oauthClient)
                .set({ disabled: !active })
                .where(eq(oauthClient.clientId, clientId))
            return c.json({ success: true })
        }
    )
    .post(
        "/apps/:clientId/rotate-secret",
        protectedSession,
        adminSession,
        async (c) => {
            const user = c.get("user")!
            const clientId = c.req.param("clientId")
            const [client] = await db
                .select({
                    clientSecret: oauthClient.clientSecret,
                    tokenEndpointAuthMethod:
                        oauthClient.tokenEndpointAuthMethod,
                    userId: oauthClient.userId,
                })
                .from(oauthClient)
                .where(eq(oauthClient.clientId, clientId))
            if (!client) return c.text("Application not found", 404)
            if (client.userId !== null && client.userId !== user.id) {
                return c.text(
                    "Only the admin who created this application can rotate its secret",
                    403
                )
            }
            if (
                !client.clientSecret ||
                client.tokenEndpointAuthMethod === "none"
            ) {
                return c.text("Public clients cannot be rotated", 400)
            }
            const clientSecret = generateSecret(32)
            await db
                .update(oauthClient)
                .set({
                    clientSecret: await hashClientSecret(clientSecret),
                    updatedAt: new Date(),
                })
                .where(eq(oauthClient.clientId, clientId))
            return c.json({ clientSecret })
        }
    )
    .delete("/apps/:clientId", protectedSession, adminSession, async (c) => {
        const user = c.get("user")!
        const clientId = c.req.param("clientId")
        const [client] = await db
            .select({ userId: oauthClient.userId })
            .from(oauthClient)
            .where(eq(oauthClient.clientId, clientId))
        if (!client) return c.text("Application not found", 404)
        if (client.userId !== null && client.userId !== user.id) {
            return c.text(
                "Only the admin who created this application can remove it",
                403
            )
        }
        await db.delete(oauthClient).where(eq(oauthClient.clientId, clientId))
        return c.json({ success: true })
    })
