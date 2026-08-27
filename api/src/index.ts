import { protectedMiddleware, publicsMiddleware } from "./middleware"
import defineHandler from "./utils/defineHandler"
import { migrateRoutes } from "./routes/migrate"
import { apiRoute } from "./api"

const app = defineHandler()
    .use("*", async (c, next) => {
        await next()
        c.header("X-Robots-Tag", "noindex, nofollow")
    })
    .use("*", publicsMiddleware)
    .use("*", protectedMiddleware)
    .route("/migrate", migrateRoutes)
    .route("/api", apiRoute)
    .get('/', (c) => {
        return c.text('API')
    })

export default app
