// currency conversion for the wallet-balances total — PawaPay itself has no
// FX endpoint (it's a payment aggregator, not a forex provider), so this
// pulls from fawazahmed0/currency-api (free, no key, 200+ currencies,
// confirmed live to cover every currency PawaPay's sandbox wallets use:
// XAF/SLE/XOF/ZMW/KES/CDF/USD/GHS/NGN/UGX/RWF/TZS/MWK/MZN)
const FX_PRIMARY_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
const FX_FALLBACK_URL = "https://latest.currency-api.pages.dev/v1/currencies/usd.json"

// usd -> lowercase currency code -> rate (1 USD = N of that currency)
export type FxRates = Record<string, number>

export async function fetchUsdRates(): Promise<FxRates> {
    let res = await fetch(FX_PRIMARY_URL).catch(() => null)
    if (!res || !res.ok) res = await fetch(FX_FALLBACK_URL)
    if (!res.ok) throw new Error(`FX rate fetch failed: ${res.status}`)
    const data = (await res.json()) as { usd: FxRates }
    return data.usd
}

// amount is in `from`'s currency; pivots through USD since that's the one
// base every rate in the cached table shares
export function convertViaUsd(amount: number, from: string, to: string, usdRates: FxRates): number | null {
    const fromRate = usdRates[from.toLowerCase()]
    const toRate = usdRates[to.toLowerCase()]
    if (!fromRate || !toRate) return null
    return (amount / fromRate) * toRate
}
