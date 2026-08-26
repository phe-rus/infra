import type DodoPayments from "dodopayments"

export type DodoCreditEntitlement = {
    id: string
    name: string
    unit: string
    balance: string
    overage: string
}

export async function getDodoCreditEntitlements(
    client: DodoPayments,
    customerId: string
): Promise<DodoCreditEntitlement[]> {
    const response =
        await client.customers.listCreditEntitlements(customerId)
    return response.items.map((item) => ({
        id: item.credit_entitlement_id,
        name: item.name,
        unit: item.unit,
        balance: item.balance,
        overage: item.overage,
    }))
}
