import type { usePaymentConfig } from "@/functions/get-payments"

export function providerLabel(
    countries: ReturnType<typeof usePaymentConfig>["data"]["countries"],
    code: string | null
) {
    if (!code) return "Payment"
    for (const country of countries) {
        const match = country.providers.find((p) => p.provider === code)
        if (match) return match.displayName
    }
    return code
}
