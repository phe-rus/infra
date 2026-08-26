import { describe, expect, it, vi, afterEach } from "vitest"
import { convertViaUsd, fetchUsdRates } from "../src/pawapay/fx"

describe("convertViaUsd", () => {
    // matches the shape fawazahmed0's API actually returns: lowercase
    // currency codes, rate per 1 USD
    const rates = { usd: 1, ugx: 3700, kes: 129 }

    it("converts an amount from one currency to another by pivoting through USD", () => {
        // 3700 UGX -> 1 USD -> 129 KES
        expect(convertViaUsd(3700, "UGX", "KES", rates)).toBeCloseTo(129, 5)
    })

    it("is a no-op converting a currency to itself", () => {
        expect(convertViaUsd(5000, "UGX", "UGX", rates)).toBeCloseTo(5000, 5)
    })

    it("is case-insensitive on currency codes", () => {
        expect(convertViaUsd(3700, "ugx", "kes", rates)).toBeCloseTo(129, 5)
        expect(convertViaUsd(3700, "UgX", "kEs", rates)).toBeCloseTo(129, 5)
    })

    it("returns null when the source currency isn't in the rate table", () => {
        expect(convertViaUsd(100, "ZZZ", "USD", rates)).toBeNull()
    })

    it("returns null when the target currency isn't in the rate table", () => {
        expect(convertViaUsd(100, "USD", "ZZZ", rates)).toBeNull()
    })
})

describe("fetchUsdRates", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("returns the primary source's rate table when it succeeds", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ usd: { ugx: 3700 } }),
            })
        )
        await expect(fetchUsdRates()).resolves.toEqual({ ugx: 3700 })
        vi.unstubAllGlobals()
    })

    it("falls back to the secondary source when the primary is unreachable", async () => {
        const fetchMock = vi
            .fn()
            .mockRejectedValueOnce(new Error("network error"))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ usd: { kes: 129 } }) })
        vi.stubGlobal("fetch", fetchMock)

        await expect(fetchUsdRates()).resolves.toEqual({ kes: 129 })
        expect(fetchMock).toHaveBeenCalledTimes(2)
        vi.unstubAllGlobals()
    })

    it("falls back to the secondary source when the primary responds not-ok", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({ ok: false, status: 503 })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ usd: { kes: 129 } }) })
        vi.stubGlobal("fetch", fetchMock)

        await expect(fetchUsdRates()).resolves.toEqual({ kes: 129 })
        vi.unstubAllGlobals()
    })

    it("throws when both sources fail", async () => {
        const fetchMock = vi
            .fn()
            .mockRejectedValueOnce(new Error("network error"))
            .mockResolvedValueOnce({ ok: false, status: 500 })
        vi.stubGlobal("fetch", fetchMock)

        await expect(fetchUsdRates()).rejects.toThrow("FX rate fetch failed")
        vi.unstubAllGlobals()
    })
})
