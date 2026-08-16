import type { BetterAuthOptions } from "better-auth/types"
import { env, waitUntil } from "cloudflare:workers"

type OptionsProps = Partial<BetterAuthOptions>
export const advanced = {
    cookiePrefix: env.VITE_APPNAME,
    useSecureCookies: env.NODE_ENV === 'production',
    crossSubDomainCookies: {
        enabled: true,
        domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
    },
    defaultCookieAttributes: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: "lax",
    },
    ipAddress: {
        ipv6Subnet: 64,
        ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
        disableIpTracking: false,
    },
    database: {
        generateId: 'uuid',
    },
    backgroundTasks: {
        handler: (p) => waitUntil(p),
    },
} satisfies OptionsProps['advanced']