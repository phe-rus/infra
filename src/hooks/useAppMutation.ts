import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from "@tanstack/react-query"
import { t } from "@/components/ui/sonner"

type OptimisticUpdate<TOptimisticData, TVariables> = {
    queryKey: QueryKey
    /** Applied to the cache immediately, before the mutation resolves. Rolled back if it errors. */
    updater: (old: TOptimisticData | undefined, variables: TVariables) => TOptimisticData
}

type MutationContext<TOptimisticData> = { previous: TOptimisticData | undefined } | undefined

type AppMutationOptions<TData, TVariables, TOptimisticData> = Omit<
    UseMutationOptions<TData, Error, TVariables, MutationContext<TOptimisticData>>,
    "onSuccess" | "onError" | "onMutate"
> & {
    /** Query keys to invalidate and wait on before the mutation settles. */
    invalidates?: QueryKey[]
    optimisticUpdate?: OptimisticUpdate<TOptimisticData, TVariables>
    successMessage?: string | ((data: TData, variables: TVariables) => string)
    successDescription?: string | ((data: TData, variables: TVariables) => string)
    errorMessage?: string
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
}

/**
 * Every domain mutation hook (users, api keys, roles, settings) builds on
 * this instead of calling useMutation directly. It reads the query client
 * from React context via useQueryClient(), the same instance every
 * useSuspenseQuery in the tree reads from, rather than each hook reaching
 * for its own reference. invalidateQueries is awaited before the mutation
 * resolves, so a caller doing `await mutateAsync(...)` is guaranteed the
 * refetch has already landed in the cache, not just kicked off.
 *
 * Pass `optimisticUpdate` for a mutation that should update the list it
 * affects before the server responds (delete a row, flip a toggle): it
 * cancels in-flight fetches for that key, snapshots the current cache,
 * applies the updater, and restores the snapshot if the mutation errors.
 * Skip it for mutations whose result can't be predicted client-side (an
 * id or field only the server generates), the invalidate-on-success below
 * still applies to those, it just isn't instant.
 */
export function useAppMutation<TData, TVariables = void, TOptimisticData = unknown>({
    invalidates = [],
    optimisticUpdate,
    successMessage,
    successDescription,
    errorMessage,
    onSuccess,
    onError,
    ...options
}: AppMutationOptions<TData, TVariables, TOptimisticData>) {
    const q = useQueryClient()
    return useMutation<TData, Error, TVariables, MutationContext<TOptimisticData>>({
        ...options,
        onMutate: async (variables) => {
            if (!optimisticUpdate) return undefined
            const { queryKey, updater } = optimisticUpdate
            await q.cancelQueries({ queryKey })
            const previous = q.getQueryData<TOptimisticData>(queryKey)
            q.setQueryData<TOptimisticData>(queryKey, (old) => updater(old, variables))
            return { previous }
        },
        onSuccess: async (data, variables) => {
            await Promise.all(invalidates.map((queryKey) => q.invalidateQueries({ queryKey })))
            if (successMessage) {
                t.success(typeof successMessage === "function" ? successMessage(data, variables) : successMessage, {
                    description:
                        typeof successDescription === "function"
                            ? successDescription(data, variables)
                            : successDescription,
                })
            }
            onSuccess?.(data, variables)
        },
        onError: (error, variables, context) => {
            if (optimisticUpdate && context) {
                q.setQueryData(optimisticUpdate.queryKey, context.previous)
            }
            t.error(errorMessage ?? "Something went wrong", { description: error.message })
            onError?.(error, variables)
        },
    })
}
