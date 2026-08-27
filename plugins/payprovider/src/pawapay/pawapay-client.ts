const BASE_URLS = {
    sandbox: "https://api.sandbox.pawapay.io",
    production: "https://api.pawapay.io",
} as const

export type PawaPayEnvironment = keyof typeof BASE_URLS

export type InitiateDepositBody = {
    depositId: string
    payer: {
        type: "MMO"
        accountDetails: { phoneNumber: string; provider: string }
    }
    amount: string
    currency: string
    clientReferenceId?: string
    customerMessage?: string
    metadata?: {
        fieldName: string
        fieldValue: string
        isPII?: boolean
    }[]
}

export type InitiateDepositResponse = {
    depositId: string
    status: "ACCEPTED" | "REJECTED" | "DUPLICATE_IGNORED"
    created?: string
    failureReason?: { failureCode: string; failureMessage: string }
}

export type InitiatePayoutBody = {
    payoutId: string
    recipient: {
        type: "MMO"
        accountDetails: { phoneNumber: string; provider: string }
    }
    amount: string
    currency: string
    clientReferenceId?: string
    customerMessage?: string
    metadata?: {
        fieldName: string
        fieldValue: string
        isPII?: boolean
    }[]
}

export type InitiatePayoutResponse = {
    payoutId: string
    status: "ACCEPTED" | "REJECTED" | "DUPLICATE_IGNORED"
    created?: string
    failureReason?: { failureCode: string; failureMessage: string }
}

export type DepositStatusResponse = {
    status: "FOUND" | "NOT_FOUND"
    data?: {
        depositId: string
        status:
            | "ACCEPTED"
            | "PROCESSING"
            | "IN_RECONCILIATION"
            | "COMPLETED"
            | "FAILED"
        amount: string
        currency: string
        failureReason?: { failureCode: string; failureMessage: string }
    }
}

export type InitiateRefundBody = {
    refundId: string
    depositId: string
    amount: string
    currency: string
    clientReferenceId?: string
    metadata?: {
        fieldName: string
        fieldValue: string
        isPII?: boolean
    }[]
}

export type InitiateRefundResponse = {
    refundId: string
    status: "ACCEPTED" | "REJECTED" | "DUPLICATE_IGNORED"
    created?: string
    failureReason?: { failureCode: string; failureMessage: string }
}

// trimmed to the fields this app actually reads — the real response also
// carries pinPromptInstructions, callbackUrl, signatureConfiguration, etc.,
// none of which the country/provider picker needs
export type ActiveConfigOperation = {
    minAmount: string
    maxAmount: string
    decimalsInAmount: "TWO_PLACES" | "NONE"
    status: "OPERATIONAL" | "DELAYED" | "CLOSED"
}

export type ActiveConfigProvider = {
    provider: string
    displayName: string
    logo: string
    currencies: {
        currency: string
        operationTypes: {
            DEPOSIT?: ActiveConfigOperation
            PAYOUT?: ActiveConfigOperation
        }
    }[]
}

export type ActiveConfigCountry = {
    country: string
    displayName: { en: string; fr: string }
    prefix: string
    flag: string
    providers: ActiveConfigProvider[]
}

export type ActiveConfigResponse = {
    countries: ActiveConfigCountry[]
}

export type WalletBalance = {
    country: string
    balance: string
    currency: string
    // empty when the wallet is pooled across every provider in that
    // country; populated with a provider code when it's provider-specific
    provider: string
}

export type WalletBalancesResponse = {
    balances: WalletBalance[]
}

export type PublicKey = { id: string; key: string }

export class PawaPayClient {
    private readonly baseUrl: string
    private readonly apiToken: string

    constructor(apiToken: string, environment: PawaPayEnvironment) {
        this.apiToken = apiToken
        this.baseUrl = BASE_URLS[environment]
    }

    private async request<T>(
        method: string,
        path: string,
        body?: unknown
    ): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        })
        const text = await res.text()
        // deposits/payouts/refunds legitimately come back with a non-2xx
        // HTTP status for a REJECTED outcome (confirmed live: 400 with a
        // real {status:"REJECTED", failureReason} body) — that's a normal
        // business result the caller already handles via `status`, not a
        // transport failure, so only throw when the body isn't that shape
        if (!res.ok) {
            const parsed = (() => {
                try {
                    return JSON.parse(text) as { status?: string }
                } catch {
                    return null
                }
            })()
            if (!parsed?.status) {
                throw new Error(
                    `PawaPay ${method} ${path} failed: ${res.status} ${text}`
                )
            }
            return parsed as T
        }
        return JSON.parse(text) as T
    }

    initiateDeposit(
        body: InitiateDepositBody
    ): Promise<InitiateDepositResponse> {
        return this.request("POST", "/v2/deposits", body)
    }

    // reconciles a deposit directly rather than waiting on the webhook —
    // a webhook can't reach a local dev instance, so this asks PawaPay
    // for the real outcome
    checkDepositStatus(depositId: string): Promise<DepositStatusResponse> {
        return this.request("GET", `/v2/deposits/${depositId}`)
    }

    // same idea, for a refund — a different resource on PawaPay's side,
    // not covered by checkDepositStatus
    checkRefundStatus(refundId: string): Promise<DepositStatusResponse> {
        return this.request("GET", `/v2/refunds/${refundId}`)
    }

    initiatePayout(
        body: InitiatePayoutBody
    ): Promise<InitiatePayoutResponse> {
        return this.request("POST", "/v2/payouts", body)
    }

    initiateRefund(
        body: InitiateRefundBody
    ): Promise<InitiateRefundResponse> {
        return this.request("POST", "/v2/refunds", body)
    }

    getPublicKeys(): Promise<PublicKey[]> {
        return this.request("GET", "/v2/public-key/http")
    }

    getActiveConfig(): Promise<ActiveConfigResponse> {
        return this.request("GET", "/v2/active-conf")
    }

    getWalletBalances(): Promise<WalletBalancesResponse> {
        return this.request("GET", "/v2/wallet-balances")
    }
}
