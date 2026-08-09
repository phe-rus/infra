import { env } from "cloudflare:workers"

export type SecuritySettings = {
    useSecureCookies: boolean
    crossSubDomainCookies: boolean
    cookieDomain: string
}

const SETTINGS_KEY = "security"

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
    useSecureCookies: false,
    crossSubDomainCookies: false,
    cookieDomain: "",
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
    const raw = await env.SET.get(SETTINGS_KEY)
    if (!raw) return DEFAULT_SECURITY_SETTINGS
    return { ...DEFAULT_SECURITY_SETTINGS, ...(JSON.parse(raw) as Partial<SecuritySettings>) }
}

export async function setSecuritySettings(update: Partial<SecuritySettings>) {
    const next = { ...(await getSecuritySettings()), ...update }
    await env.SET.put(SETTINGS_KEY, JSON.stringify(next))
    return next
}
