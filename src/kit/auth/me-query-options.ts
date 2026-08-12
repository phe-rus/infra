import { queryOptions } from "@tanstack/react-query"
import { getSession } from "./get-session"

export const meQueryOptions = () =>
    queryOptions({
        queryKey: ["me"],
        queryFn: () => getSession(),
    })
