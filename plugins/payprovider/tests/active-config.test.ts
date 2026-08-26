import { describe, expect, it } from "vitest"
import { toPaymentCountryOptions } from "../src/pawapay/active-config"
import type { ActiveConfigResponse } from "../src/pawapay/pawapay-client"

function makeRaw(
    overrides: Partial<ActiveConfigResponse["countries"][number]> = {}
): ActiveConfigResponse {
    return {
        countries: [
            {
                country: "UGA",
                displayName: { en: "Uganda", fr: "Ouganda" },
                prefix: "256",
                flag: "https://example.com/uga.svg",
                providers: [
                    {
                        provider: "MTN_MOMO_UGA",
                        displayName: "MTN Mobile Money",
                        logo: "https://example.com/mtn.svg",
                        currencies: [
                            {
                                currency: "UGX",
                                operationTypes: {
                                    DEPOSIT: {
                                        status: "OPERATIONAL",
                                        minAmount: "500",
                                        maxAmount: "5000000",
                                        decimalsInAmount: "NONE",
                                    },
                                    PAYOUT: {
                                        status: "OPERATIONAL",
                                        minAmount: "500",
                                        maxAmount: "5000000",
                                        decimalsInAmount: "NONE",
                                    },
                                },
                            },
                        ],
                    },
                ],
                ...overrides,
            },
        ],
    } as ActiveConfigResponse
}

describe("toPaymentCountryOptions", () => {
    it("maps a country's basic fields, using the English display name", () => {
        const [country] = toPaymentCountryOptions(makeRaw())
        expect(country).toMatchObject({
            country: "UGA",
            name: "Uganda",
            prefix: "256",
            flag: "https://example.com/uga.svg",
        })
    })

    it("maps a provider/currency pair into a flat provider option", () => {
        const [country] = toPaymentCountryOptions(makeRaw())
        expect(country.providers).toEqual([
            {
                provider: "MTN_MOMO_UGA",
                displayName: "MTN Mobile Money",
                logo: "https://example.com/mtn.svg",
                currency: "UGX",
                depositMinAmount: "500",
                depositMaxAmount: "5000000",
                payoutMinAmount: "500",
                payoutMaxAmount: "5000000",
                decimalsInAmount: "NONE",
            },
        ])
    })

    it("keeps a currency operational for deposit only, and leaves payout amounts null when PawaPay never sent a PAYOUT entry at all", () => {
        const raw = makeRaw()
        // PawaPay omits the PAYOUT key entirely for a deposit-only
        // corridor, it isn't present with a CLOSED status, this is what
        // actually drives `?? null` in toPaymentCountryOptions
        raw.countries[0].providers[0].currencies[0].operationTypes = {
            DEPOSIT: {
                status: "OPERATIONAL",
                minAmount: "500",
                maxAmount: "5000000",
                decimalsInAmount: "NONE",
            },
        }
        const [country] = toPaymentCountryOptions(raw)
        expect(country.providers).toHaveLength(1)
        expect(country.providers[0].payoutMinAmount).toBeNull()
        expect(country.providers[0].payoutMaxAmount).toBeNull()
    })

    it("drops only the currency that's operational for neither deposit nor payout, keeping the rest of the country", () => {
        const raw = makeRaw()
        raw.countries[0].providers[0].currencies.push({
            currency: "USD",
            operationTypes: {
                DEPOSIT: {
                    status: "CLOSED",
                    minAmount: "0",
                    maxAmount: "0",
                    decimalsInAmount: "TWO_PLACES",
                },
                PAYOUT: {
                    status: "CLOSED",
                    minAmount: "0",
                    maxAmount: "0",
                    decimalsInAmount: "TWO_PLACES",
                },
            },
        })
        const [country] = toPaymentCountryOptions(raw)
        expect(country.providers).toHaveLength(1)
        expect(country.providers[0].currency).toBe("UGX")
    })

    it("drops a country entirely once it has no usable providers left", () => {
        const raw = makeRaw()
        raw.countries[0].providers[0].currencies[0].operationTypes = {
            DEPOSIT: { status: "CLOSED", minAmount: "0", maxAmount: "0", decimalsInAmount: "NONE" },
            PAYOUT: { status: "CLOSED", minAmount: "0", maxAmount: "0", decimalsInAmount: "NONE" },
        }
        expect(toPaymentCountryOptions(raw)).toHaveLength(0)
    })

    it("defaults decimalsInAmount to TWO_PLACES when neither operation type provides one", () => {
        const raw = makeRaw()
        // an operational status with no decimalsInAmount field at all
        raw.countries[0].providers[0].currencies[0].operationTypes = {
            DEPOSIT: { status: "OPERATIONAL", minAmount: "1", maxAmount: "1" } as never,
        }
        const [country] = toPaymentCountryOptions(raw)
        expect(country.providers[0].decimalsInAmount).toBe("TWO_PLACES")
    })
})
