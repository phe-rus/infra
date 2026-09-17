import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { AdminMiddleware } from "@/middleware"
import { updateInstanceSettingsBody } from "@/auth/plugins/settings"

export const getInstanceSettings = createServerFn({
    method: "GET",
}).handler(() => auth.api.getInstanceSettings())

export const updateInstanceSettings = createServerFn({
    method: "POST",
})
    .middleware([AdminMiddleware])
    .validator(updateInstanceSettingsBody)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        return auth.api.updateInstanceSettings({
            headers,
            body: data,
        })
    })

export const uploadInstanceLogo = createServerFn({
    method: "POST",
})
    .middleware([AdminMiddleware])
    .validator((data: unknown) => data as FormData)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const file = data.get("file")
        if (!(file instanceof File)) {
            throw new Error("No file provided")
        }
        return auth.api.uploadInstanceAsset({
            headers,
            body: { file, slot: "logo" },
        })
    })

export const uploadInstanceFavicon = createServerFn({
    method: "POST",
})
    .middleware([AdminMiddleware])
    .validator((data: unknown) => data as FormData)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders()
        const file = data.get("file")
        if (!(file instanceof File)) {
            throw new Error("No file provided")
        }
        return auth.api.uploadInstanceAsset({
            headers,
            body: { file, slot: "favicon" },
        })
    })
