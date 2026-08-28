import handler from "@tanstack/react-start/server-entry"
import { createImageProxy } from "@infra/tanstack-image/server"

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

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const imageProxy = createImageProxy({
            path: "/_image",
            allowedOrigins: [env.VITE_INFRA_URL],
        })
        const proxied = await imageProxy(request, {
            waitUntil: ctx.waitUntil.bind(ctx),
        })
        if (proxied) return proxied
        return handler.fetch(request, {
            context: {
                // @ts-expect-error - Cloudflare's Env type doesn't match TanStack Start's context shape
                env: env,
                waitUntil: ctx.waitUntil.bind(ctx),
                passThroughOnException: ctx.passThroughOnException.bind(ctx),
            },
        })
    },
}
