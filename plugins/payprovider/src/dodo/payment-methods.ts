import type DodoPayments from "dodopayments"

export type DodoPaymentMethod = {
    id: string
    brand: string | null
    last4: string | null
    expiryMonth: string | null
    expiryYear: string | null
}

export async function listDodoPaymentMethods(
    client: DodoPayments,
    customerId: string
): Promise<DodoPaymentMethod[]> {
    const response = await client.customers.retrievePaymentMethods(
        customerId
    )
    return response.items.map((item) => ({
        id: item.payment_method_id,
        brand: item.card?.card_network ?? null,
        last4: item.card?.last4_digits ?? null,
        expiryMonth: item.card?.expiry_month ?? null,
        expiryYear: item.card?.expiry_year ?? null,
    }))
}

export async function removeDodoPaymentMethod(
    client: DodoPayments,
    paymentMethodId: string,
    customerId: string
): Promise<void> {
    await client.customers.deletePaymentMethod(paymentMethodId, {
        customer_id: customerId,
    })
}
