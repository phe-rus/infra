export function isTrustedOrigin(
    origin: string | null | undefined,
    trustedOrigins: string
): boolean {
    if (!origin) return false
    try {
        const { hostname } = new URL(origin)
        return trustedOrigins.split(",").some((suffix) => {
            const trusted = suffix.trim()
            return (
                hostname === trusted || hostname.endsWith(`.${trusted}`)
            )
        })
    } catch {
        return false
    }
}

export function createTrustedOrigins(
    trustedOrigins: string,
    fallbackOrigin: string
) {
    const suffixes = trustedOrigins
        .split(",")
        .map((suffix) => suffix.trim())
        .filter(Boolean)
    const patterns = suffixes.flatMap((suffix) => [
        `http://${suffix}:*`,
        `http://*.${suffix}:*`,
        `https://${suffix}`,
        `https://*.${suffix}`,
    ])
    return async (): Promise<string[]> => [...patterns, fallbackOrigin]
}
