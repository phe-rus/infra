import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
    paymentConfigOptions,
    paymentsOptions,
    usePayments,
    walletBalancesOptions,
} from "@/domains/payments"
import type { ListedPayment } from "@/domains/payments"
import { Button } from "@infra/ui/components/button"
import { ListPayments, Payment } from "@/domains/payments"
import { ViewController } from "@infra/ui/widgets/view-controller"

export const Route = createFileRoute("/_workspace/billing/")({
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.ensureQueryData(paymentsOptions()),
            q.ensureQueryData(paymentConfigOptions()),
            q.ensureQueryData(walletBalancesOptions({ currency: "UGX" })),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = usePayments()
    const [payoutOpen, setPayoutOpen] = useState(false)
    const [refundTarget, setRefundTarget] = useState<ListedPayment | null>(null)

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title="Billing"
                    description="Every deposit and payout across this instance."
                    action={
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setPayoutOpen(true)}
                        >
                            Cash out
                        </Button>
                    }
                />
            }
        >
            <ListPayments payments={data.payments} onRefund={setRefundTarget} />

            <Payment.Payout open={payoutOpen} onOpenChange={setPayoutOpen} />
            <Payment.Refund
                payment={refundTarget}
                onOpenChange={(open) => !open && setRefundTarget(null)}
            />
        </ViewController>
    )
}
