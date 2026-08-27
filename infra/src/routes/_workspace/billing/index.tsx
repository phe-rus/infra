import { Suspense, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { usePayments } from "@/domains/payments"
import type { ListedPayment } from "@/domains/payments"
import { Button } from "@infra/ui/components/button"
import { ListPayments, Payment } from "@/domains/payments"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { SectionLoader } from "@/components/section-loader"

export const Route = createFileRoute("/_workspace/billing/")({
    component: RouteComponent,
})

function BillingBody({
    payoutOpen,
    setPayoutOpen,
    refundTarget,
    setRefundTarget,
}: {
    payoutOpen: boolean
    setPayoutOpen: (open: boolean) => void
    refundTarget: ListedPayment | null
    setRefundTarget: (payment: ListedPayment | null) => void
}) {
    const { data } = usePayments()

    return (
        <>
            <ListPayments payments={data.payments} onRefund={setRefundTarget} />

            <Payment.Payout open={payoutOpen} onOpenChange={setPayoutOpen} />
            <Payment.Refund
                payment={refundTarget}
                onOpenChange={(open) => !open && setRefundTarget(null)}
            />
        </>
    )
}

function RouteComponent() {
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
            <Suspense fallback={<SectionLoader />}>
                <BillingBody
                    payoutOpen={payoutOpen}
                    setPayoutOpen={setPayoutOpen}
                    refundTarget={refundTarget}
                    setRefundTarget={setRefundTarget}
                />
            </Suspense>
        </ViewController>
    )
}
