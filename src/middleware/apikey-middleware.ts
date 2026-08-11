import { createMiddleware } from "@tanstack/react-start"
import { getEnabledMethods } from "@/auth/settings/methods-store"

export const ApiKeyEnabledMiddleware = createMiddleware()
    .server(async ({ next }) => {
        const enabledMethods = await getEnabledMethods()
        return next({
            context: {
                apiKeyEnabled: enabledMethods.apiKey,
            }
        })
    })
