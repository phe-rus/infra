import { queryOptions } from "@tanstack/react-query"
import { getUserDetail } from "./get-user-detail"

export const userDetailQueryOptions = (userId: string) =>
    queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserDetail({ data: { userId } }),
        enabled: Boolean(userId),
    })
