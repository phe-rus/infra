import { useState } from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"
import { Button } from "@infra/ui/components/button"
import { CountryProviderFields } from "@infra/ui/widgets/country-provider-fields"
import { ViewController } from "@infra/ui/widgets/view-controller"
import {
    PaymentRailToggle,
    type PaymentRail,
} from "@infra/ui/widgets/payment-rail-toggle"
import {
    payIntentSearchSchema,
    paymentConfigOptions,
    useConfirmPaymentIntent,
    useCreateDodoCheckout,
    usePaymentConfig,
    usePaymentFields,
    usePaymentIntent,
    useSyncDodoReturn,
} from "@/domains/payments"

export const Route = createFileRoute("/_protected/pay/confirm")({
    validateSearch: payIntentSearchSchema,
    loader: async ({ context }) => {
        await context.q.ensureQueryData(paymentConfigOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    useSyncDodoReturn()
    const { intent: intentId } = useSearch({ from: "/_protected/pay/confirm" })
    const { data: config } = usePaymentConfig()
    const [rail, setRail] = useState<PaymentRail>("mobile-money")
    const fields = usePaymentFields()
    const { data, timedOut, handleCheckAgain } = usePaymentIntent(intentId)
    const confirmMutation = useConfirmPaymentIntent(intentId)
    const dodoCheckoutMutation = useCreateDodoCheckout()

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
                    {config.dodoEnabled && (
                        <PaymentRailToggle value={rail} onChange={setRail} />
                    )}
                    {rail === "mobile-money" || !config.dodoEnabled ? (
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
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                isDisabled={dodoCheckoutMutation.isPending}
                                onClick={() =>
                                    dodoCheckoutMutation.mutate({
                                        // server trusts the intent's own
                                        // stored amount/currency/purpose,
                                        // these are ignored when intentId
                                        // is set — kept for the type only
                                        amount: Math.round(
                                            Number(intent.amount) * 100
                                        ),
                                        currency: intent.currency,
                                        purpose: intent.purpose ?? undefined,
                                        returnUrl: window.location.href,
                                        intentId,
                                    })
                                }
                            >
                                {dodoCheckoutMutation.isPending
                                    ? "Starting…"
                                    : "Continue to secure checkout"}
                            </Button>
                            {import.meta.env.DEV && (
                                <p className="text-xs text-muted-foreground">
                                    Test card: 4242 4242 4242 4242 · any future
                                    expiry · any CVC
                                </p>
                            )}
                        </div>
                    )}
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
