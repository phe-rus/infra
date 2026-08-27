import defineHandler from "./utils/defineHandler"
import { migrateRoutes } from "./routes/migrate"
import { assetsRoute } from "./routes/assets"
import { auth } from "./auth/auth"

const authRoutes = defineHandler()
    .on(["POST", "GET"], "/*", (c) => {
        return auth.handler(c.req.raw)
    })

const cdnRoute = defineHandler()
    .get("/*", async (c) => {
        const key = c.req.path.replace(/^\/api\/cdn\//, "")
        const object = await c.env.R2.get(key)
        if (!object) {
            return new Response(null, { status: 404 })
        }
        return new Response(object.body, {
            status: 200,
            headers: {
                "Content-Type":
                    object.httpMetadata?.contentType ??
                    "application/octet-stream",
                ...(object.httpEtag ? { ETag: object.httpEtag } : {}),
                "Cache-Control":
                    "public, max-age=31536000, stale-while-revalidate=60",
                "X-Content-Type-Options": "nosniff",
            },
        })
    })

export const apiRoute = defineHandler()
    .route("/auth", authRoutes)
    .route("/assets", assetsRoute)
    .route('/cdn', cdnRoute)
    .route("/migrate", migrateRoutes)
