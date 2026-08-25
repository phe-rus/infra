import type { BetterAuthClientPlugin } from "better-auth/client"
import type { resources } from "./index"

export { cdnPath, cdnUrl, withOrigin } from "./cdn-url"

// listObjects/deleteObjects are plain JSON in/out — $InferServerPlugin alone
// gives typed authClient.r2.list()/authClient.r2.delete() via better-auth's
// path-based inference (/r2/list -> r2.list, /r2/delete -> r2.delete).
// uploadAvatar/uploadFile take multipart FormData, so getActions wraps them
// in a nicer File-in, JSON-out call instead of making every caller build a
// FormData body by hand. getCdnFile (/cdn/**:key) isn't a "call" at all — a
// public URL, built via the exported cdnPath (same-origin) or cdnUrl
// (cross-origin, given the host it's actually reachable at), embedded
// directly (<img src>).
export const r2Client = () => {
    return {
        id: "r2",
        $InferServerPlugin: {} as ReturnType<typeof resources>,
        getActions: ($fetch) => {
            return {
                r2: {
                    uploadAvatar: async (
                        file: File,
                        options?: { userId?: string },
                        fetchOptions?: Parameters<typeof $fetch>[1]
                    ) => {
                        const formData = new FormData()
                        formData.append("file", file)
                        if (options?.userId) formData.append("userId", options.userId)
                        return $fetch<{ url: string }>("/r2/avatar", {
                            method: "POST",
                            body: formData,
                            ...fetchOptions,
                        })
                    },
                    uploadFile: async (file: File, fetchOptions?: Parameters<typeof $fetch>[1]) => {
                        const formData = new FormData()
                        formData.append("file", file)
                        return $fetch("/r2/upload", {
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
