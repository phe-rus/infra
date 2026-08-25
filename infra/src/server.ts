import {
    oauthProviderAuthServerMetadata,
    oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider"
import handler from "@tanstack/react-start/server-entry"
import { withEdgeCache } from "@infra/tanstack-image/server"
import { auth } from "../auth"
import { isTrustedOrigin } from "@infra/auth"

export type RequestContext = {
    env: Env
    waitUntil: (promise: Promise<unknown>) => void
    passThroughOnException: () => void
}

declare module "@tanstack/react-start" {
    interface Register {
        server: RequestContext
    }
}

function withNoIndex(res: Response): Response {
    const headers = new Headers(res.headers)
    headers.set("X-Robots-Tag", "noindex, nofollow")
    return new Response(res.body, { status: res.status, headers })
}

function withCors(res: Response, origin: string): Response {
    const headers = new Headers(res.headers)
    headers.set("Access-Control-Allow-Origin", origin)
    headers.set("Access-Control-Allow-Credentials", "true")
    headers.set("Vary", "Origin")
    return new Response(res.body, { status: res.status, headers })
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url)
        if (url.pathname.includes("/.well-known/openid-configuration")) {
            const openIdHandler = oauthProviderOpenIdConfigMetadata(auth)
            const res = await openIdHandler(request)
            const newHeaders = new Headers(res.headers)
            newHeaders.set("Access-Control-Allow-Methods", "GET")
            newHeaders.set("Access-Control-Allow-Origin", "*")

            return withNoIndex(
                new Response(res.body, {
                    status: res.status,
                    headers: newHeaders,
                })
            )
        }
        if (url.pathname.includes("/.well-known/oauth-authorization-server/api/auth")) {
            const authServerHandler = oauthProviderAuthServerMetadata(auth)
            const res = await authServerHandler(request)

            const newHeaders = new Headers(res.headers)
            newHeaders.set("Access-Control-Allow-Methods", "GET")
            newHeaders.set("Access-Control-Allow-Origin", "*")
            return withNoIndex(
                new Response(res.body, {
                    status: res.status,
                    headers: newHeaders,
                })
            )
        }
        if (url.pathname.endsWith("/jwks")) {
            const res = await auth.handler(request)
            const newHeaders = new Headers(res.headers)
            newHeaders.set("Access-Control-Allow-Methods", "GET")
            newHeaders.set("Access-Control-Allow-Origin", "*")

            return withNoIndex(
                new Response(res.body, {
                    status: res.status,
                    headers: newHeaders,
                })
            )
        }

        // CDN reads are public, unauthenticated, and immutable by key (see
        // getCdnFile in plugins/r2) but still went through the full
        // TanStack Start -> better-auth pipeline on every request, paying
        // for a rate-limit KV get+put (and an R2 read) even on a repeat
        // fetch of the same file a second later. withEdgeCache short-
        // circuits that for the common case; a cache miss still falls
        // through to the normal rate-limited path below
        if (request.method === "GET" && url.pathname.startsWith("/api/auth/cdn/")) {
            const res = await withEdgeCache(
                request,
                { waitUntil: ctx.waitUntil.bind(ctx) },
                async () =>
                    handler.fetch(request, {
                        context: {
                            // @ts-expect-error - Cloudflare's Env type doesn't match TanStack Start's context shape
                            env: env,
                            waitUntil: ctx.waitUntil.bind(ctx),
                            passThroughOnException: ctx.passThroughOnException.bind(ctx),
                        },
                    })
            )
            return withNoIndex(res)
        }

        const origin = request.headers.get("Origin")
        const isApiAuthPath = url.pathname.startsWith("/api/auth/")
        const originIsTrusted = isApiAuthPath && isTrustedOrigin(origin, env.TRUSTED_ORIGINS)

        if (isApiAuthPath && request.method === "OPTIONS" && originIsTrusted && origin) {
            const requestedHeaders = request.headers.get("Access-Control-Request-Headers")
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": requestedHeaders ?? "Content-Type",
                    "Access-Control-Max-Age": "86400",
                    Vary: "Origin",
                },
            })
        }

        const res = await handler.fetch(request, {
            context: {
                // @ts-expect-error - Cloudflare's Env type doesn't match TanStack Start's context shape
                env: env,
                waitUntil: ctx.waitUntil.bind(ctx),
                passThroughOnException: ctx.passThroughOnException.bind(ctx),
            },
        })
        return withNoIndex(originIsTrusted && origin ? withCors(res, origin) : res)
    },
}
