import { queryOptions } from "@tanstack/react-query"
import { listUsers } from "./list-users"

export const usersQueryOptions = () =>
    queryOptions({
        queryKey: ["users"],
        queryFn: () => listUsers(),
    })
