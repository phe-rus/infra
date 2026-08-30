import type { BetterAuthClientPlugin } from "better-auth/client"
import type { assets } from "./index"

export { cdnPath, cdnUrl, withOrigin } from "./cdn-url"

// listObjects/deleteObjects are plain JSON in/out — $InferServerPlugin alone
// gives typed authClient.assets.list()/authClient.assets.delete() via
// better-auth's path-based inference (/assets/list -> assets.list,
// /assets/delete -> assets.delete). uploadAvatar/uploadFile take multipart
// FormData, so getActions wraps them in a nicer File-in, JSON-out call
// instead of making every caller build a FormData body by hand. The public
// CDN read path is a separate, plain (non-auth) route — see cdn-url.ts —
// not part of this client plugin at all.
export const assetsClient = () => {
    return {
        id: "assets",
        $InferServerPlugin: {} as ReturnType<typeof assets>,
        getActions: ($fetch) => {
            return {
                assets: {
                    uploadAvatar: async (
                        file: File,
                        options?: { userId?: string },
                        fetchOptions?: Parameters<typeof $fetch>[1]
                    ) => {
                        const formData = new FormData()
                        formData.append("file", file)
                        if (options?.userId) formData.append("userId", options.userId)
                        return $fetch<{ url: string }>("/assets/avatar", {
                            method: "POST",
                            body: formData,
                            ...fetchOptions,
                        })
                    },
                    uploadFile: async (file: File, fetchOptions?: Parameters<typeof $fetch>[1]) => {
                        const formData = new FormData()
                        formData.append("file", file)
                        return $fetch("/assets/upload", {
                            method: "POST",
                            body: formData,
                            ...fetchOptions,
                        })
                    },
                },
            }
        },
    } satisfies BetterAuthClientPlugin
}
