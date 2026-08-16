import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { findApp, listApps } from "./fnc"

export const consoleOptions = () =>
    queryOptions({
        queryKey: ["applications"],
        queryFn: () => listApps(),
    })

export const useConsole = () => useSuspenseQuery(consoleOptions())

export const appOptions = (clientId: string) =>
    queryOptions({
        queryKey: ["applications", clientId],
        queryFn: () => findApp({ data: { clientId } }),
    })
