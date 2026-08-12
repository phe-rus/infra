import { useQuery } from "@tanstack/react-query"
import { browseQueryOptions } from "./browse-query-options"

export const useBrowseObjects = (prefix: string) => useQuery(browseQueryOptions(prefix))
