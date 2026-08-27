import { createMiddleware } from "hono/factory"
import { logger } from "hono/logger"
import { requestId } from "hono/request-id"
import { secureHeaders } from "hono/secure-headers"
import { every } from "hono/combine"
import type { AppTypes } from "../types"

export const publicsMiddleware = createMiddleware<AppTypes>(
    async (c, next) => {
        return every(secureHeaders(), requestId(), logger())(c, next)
    }
)
