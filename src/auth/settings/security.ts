import { env } from "cloudflare:workers"

export type SecuritySettings = {
    useSecureCookies: boolean
    crossSubDomainCookies: boolean
    cookieDomain: string
}

const SETTINGS_KEY = "security"

// crossSubDomainCookies stays off by default, cookieDomain just has a
// sensible value ready the moment an owner turns it on via the Providers
// page, instead of an empty field. env.COOKIE_DOMAIN is a wrangler.jsonc
// var (".pherus.org" for the real deployment); nothing needs to be set
// for local dev, since the toggle it's paired with defaults to off there
// too.
const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
    useSecureCookies: true,
    crossSubDomainCookies: false,
    cookieDomain: env.COOKIE_DOMAIN ?? "",
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
