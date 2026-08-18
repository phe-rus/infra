import { focusManager, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import type { PropsWithChildren } from "react"
import { t, ToasterProvider } from "@infra/ui/components/sonner"

if (typeof window !== "undefined") {
    focusManager.setEventListener((setFocused) => {
        setFocused(true)
        return undefined
    })
}

let cachedClient: QueryClient | undefined
type TRProviderProps = PropsWithChildren<{
    query: QueryClient
}>

export const queryContext = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
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

export function getContext(): QueryClient {
    if (typeof window !== "undefined") {
        if (!cachedClient) cachedClient = queryContext()
        return cachedClient
    }
    return queryContext()
}

export const QueryProvider = ({ children, query }: TRProviderProps) => {
    const [client] = useState(() => query)
    return (
        <QueryClientProvider client={client}>
            {children}
            <ToasterProvider richColors />
        </QueryClientProvider>
    )
}
