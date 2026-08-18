import type { ActiveConfigResponse } from "./pawapay-client"

export type PaymentProviderOption = {
    provider: string
    displayName: string
    logo: string
    currency: string
    depositMinAmount: string | null
    depositMaxAmount: string | null
    payoutMinAmount: string | null
    payoutMaxAmount: string | null
    decimalsInAmount: "TWO_PLACES" | "NONE"
}

export type PaymentCountryOption = {
    country: string
    name: string
    prefix: string
    flag: string
    providers: PaymentProviderOption[]
}

// trims PawaPay's active-conf response (which also carries USSD prompt
// scripts, callback URLs, French display names, ...) down to exactly what a
// country/provider picker needs, and drops anything neither OPERATIONAL for
// deposit nor for payout — nothing a customer could actually use right now
export function toPaymentCountryOptions(raw: ActiveConfigResponse): PaymentCountryOption[] {
    return raw.countries
        .map((country) => ({
            country: country.country,
            name: country.displayName.en,
            prefix: country.prefix,
            flag: country.flag,
            providers: country.providers.flatMap((provider) =>
                provider.currencies
                    .filter(
                        (c) =>
                            c.operationTypes.DEPOSIT?.status === "OPERATIONAL" ||
                            c.operationTypes.PAYOUT?.status === "OPERATIONAL"
                    )
                    .map(
                        (c): PaymentProviderOption => ({
                            provider: provider.provider,
                            displayName: provider.displayName,
                            logo: provider.logo,
                            currency: c.currency,
                            depositMinAmount: c.operationTypes.DEPOSIT?.minAmount ?? null,
                            depositMaxAmount: c.operationTypes.DEPOSIT?.maxAmount ?? null,
                            payoutMinAmount: c.operationTypes.PAYOUT?.minAmount ?? null,
                            payoutMaxAmount: c.operationTypes.PAYOUT?.maxAmount ?? null,
                            decimalsInAmount:
                                (c.operationTypes.DEPOSIT ?? c.operationTypes.PAYOUT)
                                    ?.decimalsInAmount ?? "TWO_PLACES",
                        })
                    )
            ),
        }))
        .filter((country) => country.providers.length > 0)
}
