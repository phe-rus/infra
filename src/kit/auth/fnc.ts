import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getMigrations } from "better-auth/db/migration"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { SessionMiddleware } from "@/kit/middleware"
import {
    completeSetupSchema,
    consentClientSchema,
    createAccountSchema,
    signInSchema,
    submitConsentSchema,
} from "./schema"

// Non-throwing on purpose: runs on every route including /sign-in and
// /setup, which handle the no-session case themselves. A throwing
// middleware here redirect-loops a fresh instance between the two.
export const getSession = createServerFn({ method: "GET" })
    .handler(async () => {
        const headers = getRequestHeaders()
        return await auth.api.getSession({ headers })
    })

export const getSetupStatus = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            const ctx = await auth.$context
            const count = await ctx.adapter.count({ model: "user" })
            return { hasOwner: count > 0 }
        } catch {
            return { hasOwner: false }
        }
    })

export const signIn = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        try {
            const headers = getRequestHeaders()
            const {
                response,
                headers: responseHeaders
            } = await auth.api.signInEmail({
                body: {
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                    ...(data.oauthQuery && {
                        oauth_query: data.oauthQuery
                    }),
                },
                headers: headers,
                returnHeaders: true,
            })
            forwardAuthHeaders(responseHeaders)
            const redirectUri = (response as { redirect_uri?: string } | undefined)?.redirect_uri
            return { error: null, redirectUri: redirectUri ?? null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message, redirectUri: null }
            throw error
        }
    })

export const signOut = createServerFn({ method: "POST" })
    .handler(async () => {
        const headers = getRequestHeaders()
        const {
            headers: responseHeaders
        } = await auth.api.signOut({
            headers,
            returnHeaders: true,
        })
        forwardAuthHeaders(responseHeaders)
    })

export const completeSetup = createServerFn({ method: "POST" })
    .validator(completeSetupSchema)
    .handler(async ({ data }) => {
        try {
            const headers = getRequestHeaders()
            const {
                headers: responseHeaders
            } = await auth.api.signUpEmail({
                body: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                },
                headers: headers,
                returnHeaders: true,
            })
            forwardAuthHeaders(responseHeaders)
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })

export const createAccount = createServerFn({ method: "POST" })
    .validator(createAccountSchema)
    .handler(async ({ data }) => {
        try {
            const headers = getRequestHeaders()
            const {
                response,
                headers: responseHeaders
            } = await auth.api.signUpEmail({
                body: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    ...(data.oauthQuery && { oauth_query: data.oauthQuery }),
                },
                headers: headers,
                returnHeaders: true,
            })
            forwardAuthHeaders(responseHeaders)
            // same continuation mechanism as signIn — present only when this
            // signup was mid-OAuth-authorize-flow
            const redirectUri = (response as { redirect_uri?: string } | undefined)?.redirect_uri
            return { error: null, redirectUri: redirectUri ?? null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message, redirectUri: null }
            throw error
        }
    })

export const getConsentClient = createServerFn({ method: "GET" })
    .middleware([SessionMiddleware])
    .validator(consentClientSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const client = await auth.api.getOAuthClientPublic({
            headers: headers,
            query: { client_id: data.clientId }
        })
        return {
            name: client.client_name ?? null,
            uri: client.client_uri ?? null
        }
    })

export const submitConsent = createServerFn({ method: "POST" })
    .middleware([SessionMiddleware])
    .validator(submitConsentSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        // the openapi metadata on this endpoint documents a `redirect_uri`
        // field, but the endpoint's real return type (confirmed against
        // the compiled plugin source) is `{ redirect: boolean; url: string }`
        const result = await auth.api.oauth2Consent({
            headers: headers,
            body: {
                accept: data.accept,
                ...(data.oauthQuery && {
                    oauth_query: data.oauthQuery
                })
            },
        })
        return {
            redirectUri: result.url
        }
    })

export const runSetupMigrations = createServerFn({ method: "POST" })
    .handler(async () => {
        const ctx = await auth.$context
        const count = await ctx.adapter.count({ model: "user" }).catch(() => 0)
        if (count > 0) {
            throw new Error("Setup is already complete: this instance already has an owner account.")
        }

        const {
            toBeCreated,
            toBeAdded,
            runMigrations
        } = await getMigrations(auth.options)
        if (toBeCreated.length === 0 && toBeAdded.length === 0) {
            return { message: "No migrations needed" }
        }

        await runMigrations()
        return {
            message: "Migrations completed successfully",
            created: toBeCreated.map((t) => t.table),
            added: toBeAdded.map((t) => t.table),
        }
    })
