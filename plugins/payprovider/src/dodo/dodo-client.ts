import DodoPayments from "dodopayments"

export type DodoEnvironment = "test_mode" | "live_mode"

export type DodoOptions = {
    apiKey: string
    webhookSecret: string
    checkoutId: string
    /** Optional: a "pay what you want" product's credit entitlement id, when a checkout should also grant/top-up a credit balance. */
    creditEntitlementId?: string
    environment: DodoEnvironment
}

export function createDodoClient(options: DodoOptions): DodoPayments {
    return new DodoPayments({
        bearerToken: options.apiKey,
        environment: options.environment,
    })
}
