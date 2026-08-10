import { getEnabledMethods, setEnabledMethods } from "@/auth/settings/methods-store"
import type { AuthMethod } from "@/auth/settings/methods"
import { createServerFn } from "@tanstack/react-start"
import { queryOptions } from "@tanstack/react-query"
import {
    getEmailPasswordSettings,
    setEmailPasswordSettings,
    type EmailPasswordSettings,
} from "@/auth/settings/email-password"
import {
    getSecuritySettings,
    setSecuritySettings,
    type SecuritySettings,
} from "@/auth/settings/security"
import { OwnerMiddleware } from "./protectionFn"

export const getAuthSettings = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getEnabledMethods()
    })

export const updateAuthSettings = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: Partial<Record<AuthMethod, boolean>>) => data)
    .handler(async ({ data }) => {
        return await setEnabledMethods(data)
    })

export const authSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ['authSettings'],
        queryFn: () => getAuthSettings(),
    })

export const getEmailPasswordAuthSettings = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getEmailPasswordSettings()
    })

export const updateEmailPasswordAuthSettings = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: Partial<EmailPasswordSettings>) => data)
    .handler(async ({ data }) => {
        return await setEmailPasswordSettings(data)
    })

export const emailPasswordAuthSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["emailPasswordAuthSettings"],
        queryFn: () => getEmailPasswordAuthSettings(),
    })

export const getSecurityAuthSettings = createServerFn({ method: "GET" })
    .handler(async () => {
        return await getSecuritySettings()
    })

export const updateSecurityAuthSettings = createServerFn({ method: "POST" })
    .middleware([OwnerMiddleware])
    .validator((data: Partial<SecuritySettings>) => data)
    .handler(async ({ data }) => {
        return await setSecuritySettings(data)
    })

export const securityAuthSettingsQueryOptions = () =>
    queryOptions({
        queryKey: ["securityAuthSettings"],
        queryFn: () => getSecurityAuthSettings(),
    })
