import { Suspense } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { formatUtc } from "@infra/ui/lib/date"
import {
    parseFailureReason,
    Receipt,
    statusVariant,
    usePayment,
} from "@/domains/payments"
import { Badge } from "@infra/ui/components/badge"
import { Button, buttonVariants } from "@infra/ui/components/button"
import { Separator } from "@infra/ui/components/separator"
import { cn } from "@infra/ui/lib/utils"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { SectionLoader } from "@/components/section-loader"

export const Route = createFileRoute("/_workspace/billing/$paymentId")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Suspense fallback={<SectionLoader />}>
            <ReceiptView />
        </Suspense>
    )
}

function ReceiptView() {
    const { paymentId } = Route.useParams()
    const { data } = usePayment(paymentId)
    if (!data) return null

    const { payment, relatedDeposit, refunds } = data
    const failureReason = parseFailureReason(payment.failureReason)

    return (
        <ViewController
            className="md:max-w-2xl print:py-4"
            heading={
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <Link
                            to="/billing"
                            className="text-xs text-muted-foreground hover:underline print:hidden"
                        >
                            ← Back to Billing
                        </Link>
                        <h1 className="text-3xl md:text-4xl">Receipt</h1>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="print:hidden"
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                </div>
            }
        >
            <section className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <p className="text-2xl font-medium">
                        {payment.amount} {payment.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {payment.referenceId}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">{payment.type}</Badge>
                    <Badge variant={statusVariant(payment.status)}>
                        {payment.status}
                    </Badge>
                </div>
            </section>

            {failureReason && (
                <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                    <p className="font-medium text-destructive">
                        {failureReason.failureCode}
                    </p>
                    <p className="text-muted-foreground">
                        {failureReason.failureMessage}
                    </p>
                </section>
            )}

            <section className="flex flex-col rounded-lg border p-4">
                <Receipt.Row
                    label="User"
                    value={payment.userName ?? payment.userId}
                />
                {payment.userEmail && (
                    <Receipt.Row label="Email" value={payment.userEmail} />
                )}
                <Separator className="my-1" />
                {payment.provider && (
                    <Receipt.Row label="Provider" value={payment.provider} />
                )}
                {payment.phoneNumber && (
                    <Receipt.Row
                        label="Phone number"
                        value={payment.phoneNumber}
                    />
                )}
                <Receipt.Row label="Currency" value={payment.currency} />
                <Separator className="my-1" />
                <Receipt.Row
                    label="Created"
                    value={formatUtc(payment.createdAt, "PPPp")}
                />
                <Receipt.Row
                    label="Updated"
                    value={formatUtc(payment.updatedAt, "PPPp")}
                />
            </section>

            {relatedDeposit && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium">
                        Refunds this deposit
                    </h2>
                    <Receipt.RelatedLink payment={relatedDeposit} />
                </section>
            )}

            {refunds.length > 0 && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium">
                        Refunds against this deposit
                    </h2>
                    <div className="flex flex-col gap-2">
                        {refunds.map((refund) => (
                            <Receipt.RelatedLink
                                key={refund.id}
                                payment={refund}
                            />
                        ))}
                    </div>
                </section>
            )}

            <Link
                to="/billing"
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-fit print:hidden"
                )}
            >
                Back to Billing
            </Link>
        </ViewController>
    )
}
