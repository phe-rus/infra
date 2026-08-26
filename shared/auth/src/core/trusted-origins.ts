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
    return async (request: Request | undefined): Promise<string[]> => {
        const origin = request?.headers.get("origin") ?? ""
        if (!origin) return [fallbackOrigin]
        return isTrustedOrigin(origin, trustedOrigins)
            ? [origin]
            : [fallbackOrigin]
    }
}
