import { hc } from "hono/client"
import type { AppType } from "api"

export const rpc = hc<AppType>(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', {
    init: {
        credentials: 'include'
    }
})
