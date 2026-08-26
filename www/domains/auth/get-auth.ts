import { queryOptions } from "@tanstack/react-query"
import { currentUser } from "./func"

export const currentOptions = () =>
    queryOptions({
        queryKey: ["me"],
        queryFn: () => currentUser(),
    })
