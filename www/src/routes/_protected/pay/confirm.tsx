import { createFileRoute, useSearch } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { CountryProviderFields } from "@infra/ui/widgets/country-provider-fields"
import { ViewController } from "@infra/ui/widgets/view-controller"
import {
    payIntentSearchSchema,
    paymentConfigOptions,
    useConfirmPaymentIntent,
    usePaymentFields,
    usePaymentIntent,
} from "@/domains/payments"

export const Route = createFileRoute("/_protected/pay/confirm")({
    validateSearch: payIntentSearchSchema,
    loader: async ({ context }) => {
        await context.q.ensureQueryData(paymentConfigOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { intent: intentId } = useSearch({ from: "/_protected/pay/confirm" })
    const fields = usePaymentFields()
    const { data, timedOut, handleCheckAgain } = usePaymentIntent(intentId)
    const confirmMutation = useConfirmPaymentIntent(intentId)

    if (!data) return <p className="container m-auto py-10">Loading…</p>

    const { intent } = data
    const awaitingConfirmation = intent.status === "created"

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Confirm payment"
                    description={`${intent.purpose ?? "Payment"}: ${intent.amount} ${intent.currency}`}
                />
            }
        >
            {awaitingConfirmation ? (
                <>
                    <CountryProviderFields idPrefix="pay-confirm" {...fields} />
                    <Button
                        type="button"
                        isDisabled={
                            !fields.phoneNumber.trim() ||
                            !fields.provider ||
                            confirmMutation.isPending
                        }
                        onClick={() =>
                            confirmMutation.mutate({
                                phoneNumber: fields.phoneNumber,
                                provider: fields.provider?.provider ?? "",
                            })
                        }
                    >
                        {confirmMutation.isPending
                            ? "Starting…"
                            : `Pay ${intent.amount} ${intent.currency}`}
                    </Button>
                </>
            ) : timedOut ? (
                <div className="flex flex-col gap-3">
                    <p className="text-muted-foreground">
                        This is taking longer than expected. You can check again, or come back to
                        this page later, your order will update once the payment goes through.
                    </p>
                    <Button type="button" variant="outline" onClick={handleCheckAgain}>
                        Check again
                    </Button>
                </div>
            ) : (
                <p className="text-muted-foreground">
                    Waiting for you to approve the mobile money prompt on your phone…
                </p>
            )}
        </ViewController>
    )
}
