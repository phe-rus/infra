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
                refetchOnWindowFocus: false,
                gcTime: 1000 * 60 * 60 * 7, // 7 days
                retry: 0
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