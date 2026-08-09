import { env } from "cloudflare:workers"
import { DEFAULT_ENABLED_METHODS, type AuthMethod } from "./methods"

const SETTINGS_KEY = "auth-methods"

export async function getEnabledMethods(): Promise<Record<AuthMethod, boolean>> {
    const raw = await env.SET.get(SETTINGS_KEY)
    if (!raw) return DEFAULT_ENABLED_METHODS
    return { ...DEFAULT_ENABLED_METHODS, ...(JSON.parse(raw) as Partial<Record<AuthMethod, boolean>>) }
}

export async function setEnabledMethods(update: Partial<Record<AuthMethod, boolean>>) {
    const next = { ...(await getEnabledMethods()), ...update }
    await env.SET.put(SETTINGS_KEY, JSON.stringify(next))
    return next
}
