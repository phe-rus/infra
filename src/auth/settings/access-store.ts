import { env } from "cloudflare:workers"

const SETTINGS_KEY = "allowed-roles"

export async function getAllowedRoles(): Promise<string[]> {
    const raw = await env.SET.get(SETTINGS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
}

export async function setAllowedRoles(roles: string[]) {
    await env.SET.put(SETTINGS_KEY, JSON.stringify(roles))
    return roles
}
