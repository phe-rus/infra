import {
    apiKeysQueryOptions,
    createApiKeyFn,
    deleteApiKeyFn,
    setApiKeyEnabledFn,
} from "@/functions/apiKeysFn"
import { useMutation } from "@tanstack/react-query"
import { getContext } from "@/lib/queryClient"
import { t } from "@/components/ui/sonner"

export const useCreateApiKey = () => {
    const q = getContext()
    return useMutation({
        mutationFn: createApiKeyFn,
        onSuccess: () => {
            q.invalidateQueries(apiKeysQueryOptions())
        },
        onError: (error) => {
            t.error("Could not create key", { description: error.message })
        },
    })
}

export const useDeleteApiKey = () => {
    const q = getContext()
    return useMutation({
        mutationFn: deleteApiKeyFn,
        onSuccess: () => {
            t.success("Key deleted")
            q.invalidateQueries(apiKeysQueryOptions())
        },
        onError: (error) => {
            t.error("Could not delete key", { description: error.message })
        },
    })
}

export const useSetApiKeyEnabled = () => {
    const q = getContext()
    return useMutation({
        mutationFn: setApiKeyEnabledFn,
        onSuccess: (_, variables) => {
            t.success(variables.data.enabled ? "Key enabled" : "Key disabled")
            q.invalidateQueries(apiKeysQueryOptions())
        },
        onError: (error) => {
            t.error("Could not update key", { description: error.message })
        },
    })
}
