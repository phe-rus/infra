import { queryOptions } from "@tanstack/react-query"
import { findApp, listApps } from "./func"

export const consoleOptions = () =>
    queryOptions({
        queryKey: ["applications"],
        queryFn: () => listApps(),
    })

export const appOptions = (clientId: string) =>
    queryOptions({
        queryKey: ["applications", clientId],
        queryFn: () => findApp({ data: { clientId } }),
    })
