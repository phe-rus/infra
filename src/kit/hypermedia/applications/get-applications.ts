import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { listApplications } from "./fnc"

export const applicationsQueryOptions = () =>
    queryOptions({
        queryKey: ["applications"],
        queryFn: () => listApplications(),
    })

export const useApplications = () => useSuspenseQuery(applicationsQueryOptions())
