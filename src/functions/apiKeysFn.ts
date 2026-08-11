import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { AuthMiddleware } from "@/middleware/auth-middleware"
import { ApiKeyEnabledMiddleware } from "@/middleware/apikey-middleware"
import { createApiKeySchema, keyIdSchema, setApiKeyEnabledSchema } from "@/schemas/api-keys"

export const listApiKeysFn = createServerFn({ method: "GET" })
    .middleware([AuthMiddleware, ApiKeyEnabledMiddleware])
    .handler(async ({ context: { apiKeyEnabled } }) => {
        // the apiKey plugin isn't registered on auth when this method is off,
        // so calling listApiKeys would throw; return empty instead of letting
        // the page's query blow up when the feature is simply disabled
        if (!apiKeyEnabled) return []
        const headers = getRequestHeaders()
        const { apiKeys } = await auth.api.listApiKeys({ headers })
        return apiKeys
    })

export const createApiKeyFn = createServerFn({ method: "POST" })
    .middleware([AuthMiddleware, ApiKeyEnabledMiddleware])
    .validator(createApiKeySchema)
    .handler(async ({ data, context: { apiKeyEnabled } }) => {
        if (!apiKeyEnabled) throw new Error("API keys are turned off for this instance")
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.createApiKey({
            headers,
            returnHeaders: true,
            body: { name: data.name, expiresIn: data.expiresIn },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })

export const deleteApiKeyFn = createServerFn({ method: "POST" })
    .middleware([AuthMiddleware, ApiKeyEnabledMiddleware])
    .validator(keyIdSchema)
    .handler(async ({ data, context: { apiKeyEnabled } }) => {
        if (!apiKeyEnabled) throw new Error("API keys are turned off for this instance")
        const headers = getRequestHeaders()
        const { headers: responseHeaders, ...result } = await auth.api.deleteApiKey({
            headers,
            returnHeaders: true,
            body: { keyId: data.keyId },
        })
        forwardAuthHeaders(responseHeaders)
        return result
    })

export const setApiKeyEnabledFn = createServerFn({ method: "POST" })
    .middleware([AuthMiddleware, ApiKeyEnabledMiddleware])
    .validator(setApiKeyEnabledSchema)
    .handler(async ({ data, context: { apiKeyEnabled } }) => {
        if (!apiKeyEnabled) throw new Error("API keys are turned off for this instance")
        const headers = getRequestHeaders()
        const { response, headers: responseHeaders } = await auth.api.updateApiKey({
            headers,
            returnHeaders: true,
            body: { keyId: data.keyId, enabled: data.enabled },
        })
        forwardAuthHeaders(responseHeaders)
        return response
    })
