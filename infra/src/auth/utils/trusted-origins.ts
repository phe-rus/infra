export function isTrustedOrigin(
    origin: string | null | undefined,
    trustedOrigins: string
): boolean {
    if (!origin) return false
    try {
        const { hostname } = new URL(origin)
        return trustedOrigins.split(",").some((suffix) => {
            const trusted = suffix.trim()
            return hostname === trusted || hostname.endsWith(`.${trusted}`)
        })
    } catch {
        return false
    }
}
