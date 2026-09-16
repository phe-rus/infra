import { focusManager, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import type { PropsWithChildren } from "react"

if (typeof window !== "undefined") {
    focusManager.setEventListener((setFocused) => {
        setFocused(true)
        return undefined
    })
}

let cachedClient: QueryClient | undefined
type QueryProviderProps = PropsWithChildren<{
    query: QueryClient
}>

export const queryContext = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                retry: (count, error) => {
                    const status = (error as { status?: number })?.status
                    return status !== 401 && status !== 403 && count < 2
                },
            },
        },
        queryCache: new QueryCache({
            onError: (error) => {
                if (error.name === "AbortError") return
                console.error(error)
            },
        }),
    })
}

export function getContext(): QueryClient {
    if (typeof window !== "undefined") {
        if (!cachedClient) cachedClient = queryContext()
        return cachedClient
    }
    return queryContext()
}

export const QueryProvider = ({ children, query }: QueryProviderProps) => {
    const [client] = useState(() => query)
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
