import { env } from "cloudflare:workers"

export type EmailPasswordSettings = {
    requireEmailVerification: boolean
}

const SETTINGS_KEY = "email-password"

const DEFAULT_EMAIL_PASSWORD_SETTINGS: EmailPasswordSettings = {
    requireEmailVerification: false,
}

export async function getEmailPasswordSettings(): Promise<EmailPasswordSettings> {
    const raw = await env.SET.get(SETTINGS_KEY)
    if (!raw) return DEFAULT_EMAIL_PASSWORD_SETTINGS
    return { ...DEFAULT_EMAIL_PASSWORD_SETTINGS, ...(JSON.parse(raw) as Partial<EmailPasswordSettings>) }
}

export async function setEmailPasswordSettings(update: Partial<EmailPasswordSettings>) {
    const next = { ...(await getEmailPasswordSettings()), ...update }
    await env.SET.put(SETTINGS_KEY, JSON.stringify(next))
    return next
}
