import type DodoPayments from "dodopayments"

export type CreateDodoCheckoutParams = {
    checkoutId: string
    creditEntitlementId?: string
    customerId: string
    // lowest-denomination integer (e.g. cents), matching how Dodo itself
    // represents amounts on a "pay what you want" cart item
    amount: number
    returnUrl: string
    grantsCredits: boolean
}

export async function createDodoCheckoutSession(
    client: DodoPayments,
    params: CreateDodoCheckoutParams
): Promise<{ sessionId: string; checkoutUrl: string }> {
    const session = await client.checkoutSessions.create({
        product_cart: [
            {
                product_id: params.checkoutId,
                quantity: 1,
                amount: params.amount,
                ...(params.grantsCredits && params.creditEntitlementId
                    ? {
                          credit_entitlements: [
                              {
                                  credit_entitlement_id:
                                      params.creditEntitlementId,
                                  // 1 credit == $1 (USD-equivalent), not 1
                                  // credit per cent — params.amount is cents
                                  credits_amount: String(
                                      Math.round(params.amount / 100)
                                  ),
                              },
                          ],
                      }
                    : {}),
            },
        ],
        customer: { customer_id: params.customerId },
        return_url: params.returnUrl,
    })

    if (!session.checkout_url) {
        throw new Error("Dodo did not return a checkout url")
    }

    return {
        sessionId: session.session_id,
        checkoutUrl: session.checkout_url,
    }
}
