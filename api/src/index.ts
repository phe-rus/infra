import { currentSession, protectedMiddleware, publicsMiddleware } from "./middleware"
import { wellKnownRoute } from "./routes/well-known"
import defineHandler from "./utils/defineHandler"
import { apiRoute } from "./api"

const app = defineHandler()
    .use("*", async (c, next) => {
        await next()
        c.header("X-Robots-Tag", "noindex, nofollow")
    })
    .use("*", publicsMiddleware)
    .use("*", protectedMiddleware)
    .use("*", currentSession)
    .route("/.well-known", wellKnownRoute)
    .route("/api", apiRoute)
    .get('/', (c) => {
        return c.text('API')
    })

export default app
