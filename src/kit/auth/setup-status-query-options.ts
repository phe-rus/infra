import { queryOptions } from "@tanstack/react-query"
import { getSetupStatus } from "./get-setup-status"

export const setupStatusQueryOptions = () =>
    queryOptions({
        queryKey: ["setup"],
        queryFn: () => getSetupStatus(),
    })
