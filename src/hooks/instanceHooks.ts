import { getInstanceAppName } from "@/functions/instanceFn"
import { queryOptions } from "@tanstack/react-query"
import { withTimeout } from "@/lib/with-timeout"

export const instanceAppNameQueryOptions = () =>
    queryOptions({
        queryKey: ["instanceAppName"],
        queryFn: () => withTimeout(getInstanceAppName)(),
    })
