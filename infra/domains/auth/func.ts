import { getRequestHeaders } from "@tanstack/react-start/server"
import { forwardAuthHeaders } from "@/lib/forward-headers"
import { createServerFn } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import { rpc } from "@/lib/rpc-client"
import {
    forgotPasswordSchema,
    resetPasswordSchema,
    setupSchema,
    signInSchema,
} from "./types"
import { AdminMiddleware } from "@/middleware"
import { getClientURL } from "@/lib/getURL"

function headers() {
    return Object.fromEntries(Object.entries(getRequestHeaders()))
}

export const getSession = createServerFn({
    method: "GET",
}).handler(async () => {
    const { data } = await authClient.getSession({
        fetchOptions: { headers: headers() },
    })
    return data
})

export const protectedSession = createServerFn({
    method: "GET",
})
    .middleware([AdminMiddleware])
    .handler(async ({ context }) => {
        return context.sessions
    })

export const getFirstUserStatus = createServerFn({
    method: "GET",
}).handler(async () => {
    try {
        const res = await rpc.api.auth["first-user"].$get()
        const hasAdmin = await res.json()
        return { hasAdmin }
    } catch {
        return { hasAdmin: false }
    }
})

export const completeSetup = createServerFn({
    method: "POST",
})
    .validator(setupSchema)
    .handler(async ({ data }) => {
        const { error } = await authClient.signUp.email({
            name: data.name,
            email: data.email,
            password: data.password,
            callbackURL: getClientURL(),
            fetchOptions: {
                headers: headers(),
                onResponse: (ctx: { response: Response }) =>
                    forwardAuthHeaders(ctx.response.headers),
            },
        })
        if (error) return { error: error.message ?? "Setup failed" }
        return { error: null }
    })

export const signIn = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        const { data: result, error } = await authClient.signIn.email({
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe,
            callbackURL: getClientURL(),
            fetchOptions: {
                headers: headers(),
                onResponse: (ctx: { response: Response }) =>
                    forwardAuthHeaders(ctx.response.headers),
            },
        })
        if (error) {
            return { error: error.message ?? "Sign in failed", redirectUri: null }
        }
        const redirectUri = (
            result as { redirect_uri?: string } | undefined
        )?.redirect_uri
        return { error: null, redirectUri: redirectUri ?? null }
    })

export const signOut = createServerFn({
    method: "POST",
}).handler(async () => {
    await authClient.signOut({
        fetchOptions: {
            headers: headers(),
            onResponse: (ctx: { response: Response }) =>
                forwardAuthHeaders(ctx.response.headers),
        },
    })
})

export const requestPasswordReset = createServerFn({
    method: "POST",
})
    .validator(forgotPasswordSchema)
    .handler(async ({ data }) => {
        await authClient.requestPasswordReset({
            email: data.email,
            redirectTo: new URL("/reset-password", getClientURL()).toString(),
            fetchOptions: { headers: headers() },
        })
        return {
            message: "If this email exists, check your inbox for a reset link",
        }
    })

export const resetPassword = createServerFn({
    method: "POST",
})
    .validator(resetPasswordSchema)
    .handler(async ({ data }) => {
        const { error } = await authClient.resetPassword({
            newPassword: data.newPassword,
            token: data.token,
            fetchOptions: { headers: headers() },
        })
        if (error) return { error: error.message ?? "Could not reset password" }
        return { error: null }
    })

