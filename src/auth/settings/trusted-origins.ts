import { env } from "cloudflare:workers"

const SETTINGS_KEY = "trusted-hostname-patterns"

const DEFAULT_TRUSTED_HOSTNAME_PATTERNS = [
    String.raw`^(.*\.)?(localhost|[0-9]{1,3}(\.[0-9]{1,3}){3})(:\d+)?$`,
    String.raw`^(.*\.)?pherus\.org$`,
]

export async function getTrustedHostnamePatterns(): Promise<string[]> {
    const raw = await env.SET.get(SETTINGS_KEY)
    if (!raw) return DEFAULT_TRUSTED_HOSTNAME_PATTERNS
    return JSON.parse(raw) as string[]
}

export async function setTrustedHostnamePatterns(patterns: string[]) {
    await env.SET.put(SETTINGS_KEY, JSON.stringify(patterns))
    return patterns
}
