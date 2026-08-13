import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { listUsers } from "./fnc"

export const usersQueryOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => listUsers(),
    })

export const useUsers = () => useSuspenseQuery(usersQueryOptions())
