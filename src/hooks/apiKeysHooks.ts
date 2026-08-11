import { createApiKeyFn, deleteApiKeyFn, listApiKeysFn, setApiKeyEnabledFn } from "@/functions/apiKeysFn"
import { useAppMutation } from "@/hooks/useAppMutation"
import { queryOptions } from "@tanstack/react-query"
import { withTimeout } from "@/lib/with-timeout"
import type { ApiKey } from "@/types"

export const apiKeysQueryOptions = () =>
    queryOptions({
        queryKey: ["apiKeys"],
        queryFn: () => withTimeout(listApiKeysFn)(),
    })

export const useCreateApiKey = () =>
    useAppMutation({
        mutationFn: withTimeout(createApiKeyFn),
        invalidates: [apiKeysQueryOptions().queryKey],
        errorMessage: "Could not create key",
    })

export const useDeleteApiKey = () =>
    useAppMutation({
        mutationFn: withTimeout(deleteApiKeyFn),
        invalidates: [apiKeysQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: apiKeysQueryOptions().queryKey,
            updater: (old: ApiKey[] | undefined, variables) =>
                (old ?? []).filter((key) => key.id !== variables.data.keyId),
        },
        successMessage: "Key deleted",
        errorMessage: "Could not delete key",
    })

export const useSetApiKeyEnabled = () =>
    useAppMutation({
        mutationFn: withTimeout(setApiKeyEnabledFn),
        invalidates: [apiKeysQueryOptions().queryKey],
        optimisticUpdate: {
            queryKey: apiKeysQueryOptions().queryKey,
            updater: (old: ApiKey[] | undefined, variables) =>
                (old ?? []).map((key) =>
                    key.id === variables.data.keyId ? { ...key, enabled: variables.data.enabled } : key
                ),
        },
        successMessage: (_, variables) => (variables.data.enabled ? "Key enabled" : "Key disabled"),
        errorMessage: "Could not update key",
    })
