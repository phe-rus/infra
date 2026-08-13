import handler from "@tanstack/react-start/server-entry"
import { execCtxStorage } from "@/auth"

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

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext,
    ) {
        return execCtxStorage.run(ctx, () =>
            handler.fetch(request, {
                context: {
                    // @ts-ignore
                    env: env,
                    waitUntil: ctx.waitUntil.bind(ctx),
                    passThroughOnException: ctx.passThroughOnException.bind(ctx),
                }
            })
        )
    }
}