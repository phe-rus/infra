import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { usePayments } from "@/kit/payments"
import type { ListedPayment } from "@/kit/payments"
import { Button } from "@infra/ui/components/button"
import { ListPayments, PayoutDialog, RefundDialog } from "@/features/payments"

export const Route = createFileRoute("/_workspace/billing/")({
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = usePayments()
    const [payoutOpen, setPayoutOpen] = useState(false)
    const [refundTarget, setRefundTarget] = useState<ListedPayment | null>(null)

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
            <section className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl">Billing</h1>
                    <Button type="button" size="sm" onClick={() => setPayoutOpen(true)}>
                        Cash out
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Every deposit and payout across this instance.
                </p>
            </section>

            <ListPayments payments={data.payments} onRefund={setRefundTarget} />

            <PayoutDialog open={payoutOpen} onOpenChange={setPayoutOpen} />
            <RefundDialog
                payment={refundTarget}
                onOpenChange={(open) => !open && setRefundTarget(null)}
            />
        </article>
    )
}
