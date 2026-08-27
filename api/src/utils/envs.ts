import { getRuntimeKey } from "hono/adapter"
import type { ApiEnv } from "../types"

async function getEnv(): Promise<ApiEnv> {
    if (getRuntimeKey() === "workerd") {
        const { env } = await import("cloudflare:workers")
        return env as unknown as ApiEnv
    } else {
        return process.env as unknown as ApiEnv
    }
}

export const env = await getEnv()
