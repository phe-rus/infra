import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { AdminMiddleware } from "@/kit/middleware"

function readImageUpload(data: unknown): { file: File; userId: string } {
    if (!(data instanceof FormData)) {
        throw new Error("Expected FormData")
    }
    const file = data.get("file")
    const userId = data.get("userId")
    if (!(file instanceof File) || typeof userId !== "string" || userId.length === 0) {
        throw new Error("Missing file or userId")
    }
    return { file, userId }
}

export const uploadUserImage = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(readImageUpload)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.uploadAvatar({
            headers,
            returnHeaders: true,
            body: { file: data.file, userId: data.userId },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })
