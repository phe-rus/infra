import { queryOptions, useQuery } from "@tanstack/react-query"
import { listObjects } from "./fnc"

export const listQueryOptions = (prefix: string) =>
    queryOptions({
        queryKey: ["objects", "list", prefix],
        queryFn: () => listObjects({ data: { prefix } }),
    })

export const useListObjects = (prefix: string) => useQuery(listQueryOptions(prefix))
