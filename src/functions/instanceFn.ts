import { createServerFn } from "@tanstack/react-start"
import { queryOptions } from "@tanstack/react-query"
import { getAppName, setAppName } from "@/auth/settings/instance"
import { OwnerMiddleware } from "./protectionFn"

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

export const instanceAppNameQueryOptions = () =>
    queryOptions({
        queryKey: ["instanceAppName"],
        queryFn: () => getInstanceAppName(),
    })
