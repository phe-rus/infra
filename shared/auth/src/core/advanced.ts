import type { BetterAuthOptions } from "better-auth/types"
import { waitUntil } from "cloudflare:workers"

type OptionsProps = Partial<BetterAuthOptions>

export type CreateAdvancedOptions = {
    appName: string
    isProduction: boolean
    cookieDomain?: string
}

export function createAdvanced({ appName, isProduction, cookieDomain }: CreateAdvancedOptions) {
    return {
        cookiePrefix: appName,
        useSecureCookies: isProduction,
        crossSubDomainCookies: {
            enabled: true,
            domain: isProduction ? cookieDomain : undefined,
        },
        defaultCookieAttributes: {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
        },
        ipAddress: {
            ipv6Subnet: 64,
            ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
            disableIpTracking: false,
        },
        database: {
            generateId: "uuid",
            joins: true,
        },
        backgroundTasks: {
            handler: (p: Promise<unknown>) => waitUntil(p),
        },
    } satisfies OptionsProps["advanced"]
}
