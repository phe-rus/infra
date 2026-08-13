import { queryOptions } from "@tanstack/react-query"
import { getSetupStatus } from "./fnc"

export const setupStatusQueryOptions = () =>
    queryOptions({
        queryKey: ["setup"],
        queryFn: () => getSetupStatus(),
    })
