import {
    oauthProviderAuthServerMetadata,
    oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider"
import handler from "@tanstack/react-start/server-entry"
import { withEdgeCache } from "@infra/tanstack-image/server"
import { auth, isTrustedOrigin } from "@/auth"

export type RequestContext = {
    env: Env
    waitUntil: (promise: Promise<unknown>) => void
    passThroughOnException: () => void
}

declare module "@tanstack/react-router" {
    interface Register {
        server: {
            requestContext: RequestContext
        }
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

async function handleOAuthMetadataRoutes(request: Request, url: URL): Promise<Response | null> {
    if (url.pathname.includes("/.well-known/openid-configuration")) {
        const res = await oauthProviderOpenIdConfigMetadata(auth)(request)
        const headers = new Headers(res.headers)
        headers.set("Access-Control-Allow-Methods", "GET")
        headers.set("Access-Control-Allow-Origin", "*")
        return withNoIndex(new Response(res.body, { status: res.status, headers }))
    }
    if (url.pathname.includes("/.well-known/oauth-authorization-server/api/auth")) {
        const res = await oauthProviderAuthServerMetadata(auth)(request)
        const headers = new Headers(res.headers)
        headers.set("Access-Control-Allow-Methods", "GET")
        headers.set("Access-Control-Allow-Origin", "*")
        return withNoIndex(new Response(res.body, { status: res.status, headers }))
    }
    if (url.pathname.endsWith("/jwks")) {
        const res = await auth.handler(request)
        const headers = new Headers(res.headers)
        headers.set("Access-Control-Allow-Methods", "GET")
        headers.set("Access-Control-Allow-Origin", "*")
        return withNoIndex(new Response(res.body, { status: res.status, headers }))
    }
    return null
}

async function handleCdnCache(
    request: Request,
    url: URL,
    context: RequestContext
): Promise<Response | null> {
    if (request.method !== "GET" || !url.pathname.startsWith("/api/cdn/")) return null
    const res = await withEdgeCache(request, { waitUntil: context.waitUntil }, async () =>
        handler.fetch(request, { context })
    )
    return withNoIndex(res)
}

function handleCorsPreflight(request: Request, url: URL, env: Env): Response | null {
    const origin = request.headers.get("Origin")
    const isApiAuthPath = url.pathname.startsWith("/api/auth/")
    if (
        !(
            isApiAuthPath &&
            request.method === "OPTIONS" &&
            origin &&
            isTrustedOrigin(origin, env.TRUSTED_ORIGINS)
        )
    ) {
        return null
    }
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

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url)
        const context: RequestContext = {
            env,
            waitUntil: ctx.waitUntil.bind(ctx),
            passThroughOnException: ctx.passThroughOnException.bind(ctx),
        }

        const metadataResponse = await handleOAuthMetadataRoutes(request, url)
        if (metadataResponse) return metadataResponse

        const cdnResponse = await handleCdnCache(request, url, context)
        if (cdnResponse) return cdnResponse

        const preflightResponse = handleCorsPreflight(request, url, env)
        if (preflightResponse) return preflightResponse

        const origin = request.headers.get("Origin")
        const originIsTrusted =
            url.pathname.startsWith("/api/auth/") && isTrustedOrigin(origin, env.TRUSTED_ORIGINS)

        const res = await handler.fetch(request, { context })
        return withNoIndex(originIsTrusted && origin ? withCors(res, origin) : res)
    },
}
