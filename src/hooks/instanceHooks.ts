import { getInstanceAppName } from "@/functions/instanceFn"
import { queryOptions } from "@tanstack/react-query"

export const instanceAppNameQueryOptions = () =>
    queryOptions({
        queryKey: ["instanceAppName"],
        queryFn: () => getInstanceAppName(),
    })
