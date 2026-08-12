import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/kit/middleware"
import { deleteObjectSchema } from "@/kit/schemas"

export const deleteObject = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(deleteObjectSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.deleteObject({ headers, body: { key: data.key } })
    })
