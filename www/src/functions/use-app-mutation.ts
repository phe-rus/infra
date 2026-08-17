import {
    useMutation,
    useQueryClient,
    type QueryKey,
    type UseMutationOptions,
} from "@tanstack/react-query"
import { t } from "@infra/ui/components/sonner"

type OptimisticUpdate<TOptimisticData, TVariables> = {
    queryKey: QueryKey
    /** Applied to the cache immediately, before the mutation resolves. Rolled back if it errors. */
    updater: (old: TOptimisticData | undefined, variables: TVariables) => TOptimisticData
}

type MutationContext<TOptimisticData> =
    { previous: TOptimisticData | undefined; next: TOptimisticData } | undefined

type AppMutationOptions<TData, TVariables, TOptimisticData> = Omit<
    UseMutationOptions<TData, Error, TVariables, MutationContext<TOptimisticData>>,
    "onSuccess" | "onError" | "onMutate" | "onSettled"
> & {
    /** Query keys to invalidate once the mutation settles, win or lose. */
    invalidates?: QueryKey[]
    optimisticUpdate?: OptimisticUpdate<TOptimisticData, TVariables>
    successMessage?: string | ((data: TData, variables: TVariables) => string)
    successDescription?: string | ((data: TData, variables: TVariables) => string)
    errorMessage?: string
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
}

// every domain mutation hook builds on this instead of calling useMutation
// directly, mirroring infra's kit/shared/use-app-mutation.ts. authClient
// calls resolve with {data,error} rather than throwing, so a mutationFn
// passed here is expected to check `error` itself and throw — this hook
// only deals with the thrown-Error shape, same as infra's server fns do
// natively.
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
            const next = updater(previous, variables)
            q.setQueryData<TOptimisticData>(queryKey, next)
            return { previous, next }
        },
        onSuccess: (data, variables) => {
            if (successMessage) {
                t.success(
                    typeof successMessage === "function"
                        ? successMessage(data, variables)
                        : successMessage,
                    {
                        description:
                            typeof successDescription === "function"
                                ? successDescription(data, variables)
                                : successDescription,
                    }
                )
            }
            onSuccess?.(data, variables)
        },
        onError: (error, variables, context) => {
            if (optimisticUpdate && context) {
                const current = q.getQueryData(optimisticUpdate.queryKey)
                // only roll back if nothing else has written to this key
                // since our optimistic value landed, otherwise this would
                // silently discard a concurrent mutation's newer change
                if (current === context.next) {
                    q.setQueryData(optimisticUpdate.queryKey, context.previous)
                }
            }
            t.error(errorMessage ?? "Something went wrong", { description: error.message })
            onError?.(error, variables)
        },
        onSettled: () => {
            for (const queryKey of invalidates) {
                void q.invalidateQueries({ queryKey })
            }
        },
    })
}
