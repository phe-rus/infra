import { secureHeaders } from "hono/secure-headers"
import { createMiddleware } from "hono/factory"
import { requestId } from "hono/request-id"
import { every } from "hono/combine"
import type { AppTypes } from "../types"

export const publicsMiddleware = createMiddleware<AppTypes>(
    async (c, next) => {
        return every(secureHeaders(), requestId())(c, next)
    }
)
