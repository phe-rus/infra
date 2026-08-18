import handler from "@tanstack/react-start/server-entry"

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
        return handler.fetch(request, {
            context: {
                // @ts-ignore - Cloudflare's Env type doesn't match TanStack Start's context shape
                env: env,
                waitUntil: ctx.waitUntil.bind(ctx),
                passThroughOnException: ctx.passThroughOnException.bind(ctx),
            },
        })
    },
}
