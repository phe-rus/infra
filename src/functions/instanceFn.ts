import { createServerFn } from "@tanstack/react-start"
import { getAppName, setAppName } from "@/auth/settings/instance"
import { OwnerMiddleware } from "@/middleware/owner-middleware"

export const getInstanceAppName = createServerFn({ method: "GET" }).handler(async () => {
    return { appName: await getAppName() }
})

export const updateAppName = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: { appName: string }) => data)
    .handler(async ({ data }) => {
        await setAppName(data.appName)
        return { appName: data.appName }
    })
