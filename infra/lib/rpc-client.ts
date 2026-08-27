import { hc } from "hono/client"
import type { AppType } from "api"
import { apiUrl } from "./auth-client"

export const rpc = hc<AppType>(apiUrl())
