import { createServerFn } from "@tanstack/react-start"
import { getEnabledMethods, setEnabledMethods, type AuthMethod } from "@/auth/settings/methods"
import { OwnerMiddleware } from "./protectionFn"

export const getAuthSettings = createServerFn({ method: "GET" }).handler(async () => {
    return await getEnabledMethods()
})

export const updateAuthSettings = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: Partial<Record<AuthMethod, boolean>>) => data)
    .handler(async ({ data }) => {
        return await setEnabledMethods(data)
    })
