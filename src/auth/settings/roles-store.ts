import { env } from "cloudflare:workers"
import type { CustomRole } from "@/types"

const SETTINGS_KEY = "custom-roles"

export async function getCustomRoles(): Promise<CustomRole[]> {
    const raw = await env.SET.get(SETTINGS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CustomRole[]
}

export async function setCustomRoles(roles: CustomRole[]) {
    await env.SET.put(SETTINGS_KEY, JSON.stringify(roles))
    return roles
}
