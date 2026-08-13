import { queryOptions, useQuery } from "@tanstack/react-query"
import { browseObjects } from "./fnc"

export const browseQueryOptions = (prefix: string) =>
    queryOptions({
        queryKey: ["objects", "browse", prefix],
        queryFn: () => browseObjects({ data: { prefix } }),
    })

export const useBrowseObjects = (prefix: string) => useQuery(browseQueryOptions(prefix))
