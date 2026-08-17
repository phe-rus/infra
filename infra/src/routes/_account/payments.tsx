import { createFileRoute } from "@tanstack/react-router"
import { myPaymentsOptions, paymentConfigOptions, useMyPayments } from "@/kit/payments"
import { DepositForm, PaymentHistory } from "@/features/payments"

export const Route = createFileRoute("/_account/payments")({
    loader: async ({ context: { q } }) => {
        await Promise.all([
            q.ensureQueryData(myPaymentsOptions()),
            q.ensureQueryData(paymentConfigOptions()),
        ])
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = useMyPayments()

    return (
        <article className="container mx-auto flex w-full flex-col gap-8 py-20 md:max-w-md">
            <section>
                <h1 className="text-3xl md:text-4xl">Payments</h1>
                <p className="text-muted-foreground">
                    Fund your account and review your payment history.
                </p>
            </section>

            <DepositForm />

            <section className="flex flex-col gap-3">
                <h2 className="text-xl">History</h2>
                <PaymentHistory payments={data.payments} />
            </section>
        </article>
    )
}
