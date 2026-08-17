import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type PropsWithChildren } from "react"

let query: QueryClient | undefined

export const queryContext = () => {
    return new QueryClient()
}

export function getContext(): QueryClient {
    if (typeof window !== "undefined") {
        if (!query) query = queryContext()
        return query
    }
    return queryContext()
}

export const QueryProvider = ({ children, query }: PropsWithChildren<{ query: QueryClient }>) => {
    const [client] = useState(() => query)
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
