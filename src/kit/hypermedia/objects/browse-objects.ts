import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/kit/middleware"
import * as z from "zod"

const browsePrefixSchema = z.object({ prefix: z.string().optional() })

export const browseObjects = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .validator(browsePrefixSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.browseObjects({ headers, query: { prefix: data.prefix } })
    })
