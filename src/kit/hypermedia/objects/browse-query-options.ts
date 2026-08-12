import { queryOptions } from "@tanstack/react-query"
import { browseObjects } from "./browse-objects"

export const browseQueryOptions = (prefix: string) =>
    queryOptions({
        queryKey: ["objects", "browse", prefix],
        queryFn: () => browseObjects({ data: { prefix } }),
    })
