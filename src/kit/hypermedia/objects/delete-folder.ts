import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/kit/middleware"
import { deleteFolderSchema } from "@/kit/schemas"

export const deleteFolder = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(deleteFolderSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return await auth.api.deleteFolder({ headers, body: { prefix: data.prefix } })
    })
