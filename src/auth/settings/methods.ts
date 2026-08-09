import { env } from "cloudflare:workers"

export const AUTH_METHODS = [
    "emailAndPassword",
    "twoFactor",
    "username",
    "anonymous",
    "phoneNumber",
    "magicLink",
    "emailOTP",
    "passkey",
] as const

export type AuthMethod = (typeof AUTH_METHODS)[number]

const SETTINGS_KEY = "auth-methods"

const DEFAULT_ENABLED: Record<AuthMethod, boolean> = {
    emailAndPassword: true,
    twoFactor: false,
    username: false,
    anonymous: false,
    phoneNumber: false,
    magicLink: false,
    emailOTP: false,
    passkey: false,
}

export async function getEnabledMethods(): Promise<Record<AuthMethod, boolean>> {
    const raw = await env.SET.get(SETTINGS_KEY)
    if (!raw) return DEFAULT_ENABLED
    return { ...DEFAULT_ENABLED, ...(JSON.parse(raw) as Partial<Record<AuthMethod, boolean>>) }
}

export async function setEnabledMethods(update: Partial<Record<AuthMethod, boolean>>) {
    const next = { ...(await getEnabledMethods()), ...update }
    await env.SET.put(SETTINGS_KEY, JSON.stringify(next))
    return next
}

const METHOD_PATH_PREFIXES: Record<AuthMethod, string[]> = {
    emailAndPassword: ["/sign-in/email", "/sign-up/email"],
    twoFactor: ["/two-factor/"],
    username: ["/sign-in/username"],
    anonymous: ["/sign-in/anonymous"],
    phoneNumber: ["/phone-number/"],
    magicLink: ["/sign-in/magic-link"],
    emailOTP: ["/email-otp/"],
    passkey: ["/passkey/"],
}

export function methodForPath(path: string): AuthMethod | null {
    for (const method of AUTH_METHODS) {
        if (METHOD_PATH_PREFIXES[method].some((prefix) => path.startsWith(prefix))) {
            return method
        }
    }
    return null
}
