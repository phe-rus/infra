import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { AdminMiddleware } from "@/kit/middleware"
import { applicationIdSchema, createApplicationSchema, setApplicationActiveSchema } from "@/kit/schemas"

function readLogoUpload(data: unknown): { file: File; applicationId: string } {
    if (!(data instanceof FormData)) {
        throw new Error("Expected FormData")
    }
    const file = data.get("file")
    const applicationId = data.get("applicationId")
    if (!(file instanceof File) || typeof applicationId !== "string" || applicationId.length === 0) {
        throw new Error("Missing file or applicationId")
    }
    return { file, applicationId }
}

export const createApplication = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(createApplicationSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.createApplication({
            headers,
            returnHeaders: true,
            body: { name: data.name, type: data.type, identifier: data.identifier },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })

export const listApplications = createServerFn({ method: "GET" })
    .middleware([AdminMiddleware])
    .handler(async () => {
        const headers = getRequestHeaders()
        return await auth.api.listApplications({ headers })
    })

export const setApplicationActive = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(setApplicationActiveSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.setApplicationActive({
            headers,
            returnHeaders: true,
            body: { applicationId: data.applicationId, active: data.active },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })

export const rotateApplication = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(applicationIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.rotateApplication({
            headers,
            returnHeaders: true,
            body: { applicationId: data.applicationId },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })

export const removeApplication = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(applicationIdSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.removeApplication({
            headers,
            returnHeaders: true,
            body: { applicationId: data.applicationId },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const uploadApplicationLogo = createServerFn({ method: "POST" })
    .middleware([AdminMiddleware])
    .validator(readLogoUpload)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.uploadApplicationLogo({
            headers,
            returnHeaders: true,
            body: { file: data.file, applicationId: data.applicationId },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })
