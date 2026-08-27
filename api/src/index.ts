import { protectedMiddleware, publicsMiddleware, currentSession } from "./middleware"
import defineHandler from "./utils/defineHandler"
import { apiRoute } from "./api"

const app = defineHandler()
    .use("*", publicsMiddleware)
    .use("*", protectedMiddleware)
    .use("*", async (c, next) => {
        await next()
        c.header("X-Robots-Tag", "noindex, nofollow")
    })
    .use("*", currentSession)
    .route("/api", apiRoute)
    .get('/', (c) => {
        return c.text('API')
    })

export default app
