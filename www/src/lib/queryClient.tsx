import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { PropsWithChildren } from "react"
import { t } from "@infra/ui/components/sonner"
import { useState } from "react"

let cachedClient: QueryClient | undefined
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
                t.error(error.name, {
                    description: error.message,
                    duration: 5000,
                })
            },
        }),
    })
}

export function getContext() {
    if (typeof window !== "undefined") {
        if (!cachedClient) cachedClient = queryContext()
        return cachedClient
    }
    return queryContext()
}

export const QueryProvider = ({ query, children }: PropsWithChildren<{ query: QueryClient }>) => {
    const [client] = useState(() => query)
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
