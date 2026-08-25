import { useState } from "react"
import { usePaymentConfig } from "@/domains/payments"

// Uganda — matches where this instance's operator actually is
const DEFAULT_COUNTRY = "UGA"

// same cascade as www's features/payments/useWalletFields — see that file's
// comment for why this stays a separate small copy instead of shared
export function usePaymentFields() {
    const { data } = usePaymentConfig()
    const countries = data.countries
    // explicitly typed to include `undefined`: countries[0] is only a real
    // fallback if the list isn't empty, which the array type alone can't
    // guarantee
    const defaultCountry: (typeof countries)[number] | undefined =
        countries.find((c) => c.country === DEFAULT_COUNTRY) ?? countries[0]

    const [countryCode, setCountryCode] = useState(
        defaultCountry?.country ?? ""
    )
    const [providerCode, setProviderCode] = useState(
        defaultCountry?.providers[0]?.provider ?? ""
    )
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
