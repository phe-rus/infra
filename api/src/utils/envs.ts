import { getRuntimeKey } from "hono/adapter"

async function getEnv() {
    if (getRuntimeKey() === "workerd") {
        const { env } = await import("cloudflare:workers")
        return env as Env
    } else {
        return process.env as unknown as Env
    }
}

export const env = await getEnv()
