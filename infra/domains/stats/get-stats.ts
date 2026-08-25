import { queryOptions } from "@tanstack/react-query"
import { getStats } from "./func"

export const statsOptions = () =>
    queryOptions({
        queryKey: ["stats"],
        queryFn: () => getStats(),
    })
