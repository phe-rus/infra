import { createMiddleware } from "hono/factory"
import { cors } from "hono/cors"
import { csrf } from "hono/csrf"
import type { AppTypes } from "../types"
import { every, except } from "hono/combine"

export const protectedMiddleware = createMiddleware<AppTypes>(
    async (c, next) => {
        return every(
            cors({
                allowMethods: [
                    "POST",
                    "GET",
                    "PATCH",
                    "PUT",
                    "DELETE",
                    "OPTIONS",
                ],
                allowHeaders: ["Content-Type", "Authorization"],
                exposeHeaders: [
                    "Content-Length",
                    "X-Request-ID",
                    "cf-connecting-ip",
                    "x-forwarded-for",
                ],
                origin: (origin) => origin,
                credentials: true,
                maxAge: 1200,
            }),
            except(
                "/api/auth",
                csrf({
                    origin: (origin, c) => {
                        const dev = c.env.NODE_ENV === "development"
                        return [
                            /^https?:\/\/.*\.pherus\.org\/?/,
                            dev && /^https?:\/\/localhost(:\d+)?\/?/,
                            dev && /^https?:\/\/\[::\](:\d+)?\/?/,
                            dev && /^https?:\/\/\[IPv6::\](:\d+)?\/?/,
                            dev && /^https?:\/\/\[::1\](:\d+)?\/?/,
                            dev && /^https?:\/\/\[IPv6::1\](:\d+)?\/?/,
                        ].some((r) => {
                            if (!r) return false
                            return r.test(origin || "")
                        })
                    },
                })
            )
        )(c, next)
    }
)
