import { queryOptions } from "@tanstack/react-query"
import { listObjects } from "./func"

export const listOptions = (prefix: string) =>
    queryOptions({
        queryKey: ["objects", "list", prefix],
        queryFn: () => listObjects({ data: { prefix } }),
    })
