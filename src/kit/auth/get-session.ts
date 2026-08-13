import { queryOptions } from "@tanstack/react-query"
import { getSession } from "./fnc"

export const meQueryOptions = () =>
    queryOptions({
        queryKey: ["me"],
        queryFn: () => getSession(),
    })
