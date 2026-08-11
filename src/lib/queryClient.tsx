import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type PropsWithChildren } from "react"
import { t, ToasterProvider } from "@/components/ui/sonner"

let query: QueryClient | undefined
type TRProviderProps = PropsWithChildren<{
    query: QueryClient
}>

export const queryContext = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                networkMode: 'offlineFirst',
                staleTime: 1000 * 30, // 30 seconds: short enough that a page revisited after a beat re-syncs, long enough to skip refetching on quick back-and-forth navigation
                gcTime: 1000 * 60 * 60, // 1 hour
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                retry: (count, error) => {
                    const status = (error as any)?.status
                    return status !== 401 && status !== 403 && count < 2
                }
            }
        },
        queryCache: new QueryCache({
            onError: (error) => {
                if (error.name === 'AbortError') return
                t.error(error.name ?? 'Error', {
                    description: error.message,
                    duration: 5000
                })
            }
        })
    })
}

export function getContext(): QueryClient {
    if (typeof window !== 'undefined') {
        if (!query) query = queryContext()
        return query
    }
    return queryContext()
}


export const QueryProvider = ({ children, query }: TRProviderProps) => {
    const [client] = useState(() => query)
    return (
        <QueryClientProvider client={client}>
            <>
                {children}
                <ToasterProvider richColors />
            </>
        </QueryClientProvider>
    )
}