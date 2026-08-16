import { oauthProviderAuthServerMetadata, oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import handler from "@tanstack/react-start/server-entry"
import { auth } from "./auth";

export type RequestContext = {
    env: Env;
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

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext,
    ) {
        const url = new URL(request.url);
        if (url.pathname.includes('/.well-known/openid-configuration')) {
            const openIdHandler = oauthProviderOpenIdConfigMetadata(auth)
            const res = await openIdHandler(request)
            const newHeaders = new Headers(res.headers)
            newHeaders.set("Access-Control-Allow-Methods", "GET")
            newHeaders.set("Access-Control-Allow-Origin", "*")

            return withNoIndex(new Response(res.body, {
                status: res.status,
                headers: newHeaders
            }))
        }
        if (url.pathname.includes('/api/auth/.well-known/oauth-authorization-server')) {
            const authServerHandler = oauthProviderAuthServerMetadata(auth)
            const res = await authServerHandler(request)

            const newHeaders = new Headers(res.headers)
            newHeaders.set("Access-Control-Allow-Methods", "GET")
            newHeaders.set("Access-Control-Allow-Origin", "*")
            return withNoIndex(new Response(res.body, {
                status: res.status,
                headers: newHeaders
            }))
        }
        if (url.pathname.endsWith('/jwks')) {
            const res = await auth.handler(request)
            const newHeaders = new Headers(res.headers)
            newHeaders.set("Access-Control-Allow-Methods", "GET")
            newHeaders.set("Access-Control-Allow-Origin", "*")

            return withNoIndex(new Response(res.body, {
                status: res.status,
                headers: newHeaders
            }))
        }
        const res = await handler.fetch(request, {
            context: {
                // @ts-ignore
                env: env,
                waitUntil: ctx.waitUntil.bind(ctx),
                passThroughOnException: ctx.passThroughOnException.bind(ctx),
            }
        })
        return withNoIndex(res)
    }
}