import { useState } from "react"
import { usePaymentConfig } from "./use-payments"

// Uganda — same default infra's own deposit form uses
const DEFAULT_COUNTRY = "UGA"

// the country -> provider -> phone-prefix cascade a wallet number picker
// needs, same shape as infra's own domains/payments/use-payment-fields.ts.
// Deliberately a separate small copy rather than shared: it's app-level
// state (useState), and neither @infra/ui (UI-only, no business logic) nor
// @infra/payment (framework-agnostic on purpose, no React) is a clean home
// for it. Keep the two in sync if the cascade logic itself ever changes.
export function usePaymentFields() {
    const { data } = usePaymentConfig()
    const countries = data.countries
    // explicitly typed to include `undefined`: countries[0] is only a real
    // fallback if the list isn't empty, which the array type alone can't
    // guarantee
    const defaultCountry: (typeof countries)[number] | undefined =
        countries.find((c) => c.country === DEFAULT_COUNTRY) ?? countries[0]

    const [countryCode, setCountryCode] = useState(defaultCountry?.country ?? "")
    const [providerCode, setProviderCode] = useState(defaultCountry?.providers[0]?.provider ?? "")
    const [phoneNumber, setPhoneNumber] = useState(defaultCountry?.prefix ?? "")

    const country = countries.find((c) => c.country === countryCode)
    const provider = country?.providers.find((p) => p.provider === providerCode)

    function selectCountry(nextCode: string) {
        const nextCountry = countries.find((c) => c.country === nextCode)
        setCountryCode(nextCode)
        setProviderCode(nextCountry?.providers[0]?.provider ?? "")
        setPhoneNumber(nextCountry?.prefix ?? "")
    }

    function reset() {
        setCountryCode(defaultCountry?.country ?? "")
        setProviderCode(defaultCountry?.providers[0]?.provider ?? "")
        setPhoneNumber(defaultCountry?.prefix ?? "")
    }

    return {
        countries,
        country,
        countryCode,
        selectCountry,
        provider,
        providerCode,
        setProviderCode,
        phoneNumber,
        setPhoneNumber,
        reset,
    }
}
