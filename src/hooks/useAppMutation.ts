import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from "@tanstack/react-query"
import { t } from "@/components/ui/sonner"

/**
 * Runs several independent server calls for one logical save (team roles'
 * custom-roles + allowed-roles, provider settings' four separate update*
 * calls) and reports every failure, not just the first. Plain
 * `Promise.all` rejects the instant one call rejects, but the others it
 * started keep running and their success or failure is silently lost, the
 * caller sees a generic error with no idea some of the change already
 * landed server-side. This always lets every call finish, then throws one
 * combined error listing each failure if any happened, so at least the
 * user (and errorMessage's description) knows exactly what didn't save,
 * instead of an all-or-nothing illusion the calls don't actually provide.
 */
export async function settleAll(calls: Array<() => Promise<unknown>>): Promise<void> {
    const results = await Promise.allSettled(calls.map((call) => call()))
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected")
    if (failures.length > 0) {
        throw new Error(
            failures.map((f) => (f.reason instanceof Error ? f.reason.message : String(f.reason))).join("; ")
        )
    }
}

type OptimisticUpdate<TOptimisticData, TVariables> = {
    queryKey: QueryKey
    /** Applied to the cache immediately, before the mutation resolves. Rolled back if it errors. */
    updater: (old: TOptimisticData | undefined, variables: TVariables) => TOptimisticData
}

type MutationContext<TOptimisticData> = { previous: TOptimisticData | undefined; next: TOptimisticData } | undefined

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

/**
 * Every domain mutation hook (users, api keys, roles, settings) builds on
 * this instead of calling useMutation directly. It reads the query client
 * from React context via useQueryClient(), the same instance every
 * useSuspenseQuery in the tree reads from, rather than each hook reaching
 * for its own reference.
 *
 * Every mutationFn passed in should already be wrapped with withTimeout
 * (src/lib/with-timeout.ts), see any use*Hooks.ts file. That's what
 * actually bounds how long a mutation can sit "pending": a plain fetch()
 * has no default timeout, and the local dev runtime has been observed
 * accepting a request and never responding to it at all, neither
 * resolving nor rejecting. react-query's isPending only flips to false
 * once the mutationFn promise itself settles, so without a timeout that
 * fetch is the one thing here that can genuinely hang forever, no amount
 * of tuning onMutate/onSuccess/onSettled changes that, they only run once
 * mutationFn has already settled one way or the other.
 *
 * Invalidation happens in onSettled, not onSuccess, so it runs whether the
 * mutation succeeds or fails: an optimistic rollback below restores a
 * client-side snapshot that can itself already be stale, invalidating
 * closes that gap either way. It's fired, not awaited, callers don't need
 * to see the refetch land before mutateAsync resolves, everything
 * re-renders reactively off the cache once it does.
 *
 * Pass `optimisticUpdate` for a mutation that should update the list it
 * affects before the server responds (delete a row, flip a toggle): it
 * awaits cancelQueries for that key (the documented react-query pattern,
 * narrows the window where an in-flight refetch could land after the
 * optimistic write and clobber it), snapshots the current cache, applies
 * the updater, and restores the snapshot if the mutation errors. The
 * rollback only restores if the cache still holds exactly what this
 * mutation itself wrote: if a second mutation on the same queryKey applied
 * its own optimistic write in between and this one then fails, blindly
 * restoring this mutation's pre-write snapshot would silently erase the
 * second mutation's still-in-flight change. Skipping the rollback in that
 * case just leaves the newer optimistic value in place until onSettled's
 * invalidate reconciles everything with the server shortly after.
 * Skip optimisticUpdate entirely for mutations whose result can't be
 * predicted client-side (an id or field only the server generates), the
 * invalidate in onSettled still applies to those, it just isn't instant.
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
            const next = updater(previous, variables)
            q.setQueryData<TOptimisticData>(queryKey, next)
            return { previous, next }
        },
        onSuccess: (data, variables) => {
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
