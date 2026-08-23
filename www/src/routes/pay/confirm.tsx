import { createFileRoute, redirect, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { Button } from "@infra/ui/components/button"
import { CountryProviderFields } from "@infra/ui/widgets/country-provider-fields"
import { authClient } from "@/lib/auth-client"
import { useWalletFields } from "@/features/payments/use-wallet-fields"

const searchSchema = z.object({ intent: z.string() })

export const Route = createFileRoute("/pay/confirm")({
    validateSearch: searchSchema,
    beforeLoad: ({ location, context }) => {
        if (!context.session) {
            throw redirect({ href: `/sign-in${location.searchStr}`, replace: true })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { intent: intentId } = useSearch({ from: "/pay/confirm" })
    const fields = useWalletFields()
    const [error, setError] = useState<string | null>(null)

    const { data } = useQuery({
        queryKey: ["pay-intent", intentId],
        queryFn: async () => {
            const { data, error: fetchError } = await authClient.pay.intent.get({
                query: { id: intentId },
            })
            if (fetchError) throw new Error(fetchError.message ?? "Could not load this payment")
            return data
        },
        refetchInterval: (query) => {
            const status = query.state.data?.intent.status
            return status === "completed" || status === "failed" ? false : 2000
        },
    })

    // once PawaPay resolves it, infra hands back a signed token alongside
    // the terminal status — that's the whole point of this page: the
    // requesting app never has to trust this redirect itself, only the
    // token in it (verified against infra's own JWKS on the other end)
    useEffect(() => {
        if (!data?.token) return
        const url = new URL(data.intent.returnUrl)
        url.searchParams.set("intent", data.intent.id)
        url.searchParams.set("token", data.token)
        window.location.href = url.toString()
    }, [data])

    const confirmMutation = useMutation({
        mutationFn: async () => {
            if (!fields.provider || !fields.phoneNumber.trim()) {
                throw new Error("Pick a mobile money number")
            }
            const { error: confirmError } = await authClient.pay.intent.confirm({
                id: intentId,
                phoneNumber: fields.phoneNumber,
                provider: fields.provider.provider,
            })
            if (confirmError) {
                throw new Error(confirmError.message ?? "Could not start this payment")
            }
        },
        onError: (mutationError) => setError(mutationError.message),
    })

    if (!data) return <p className="container m-auto py-10">Loading…</p>

    const { intent } = data
    const awaitingConfirmation = intent.status === "created"

    return (
        <div className="container m-auto flex w-full max-w-md flex-col gap-5 py-10">
            <section>
                <h1 className="text-3xl">Confirm payment</h1>
                <p className="text-muted-foreground">
                    {intent.purpose ?? "Payment"}: {intent.amount} {intent.currency}
                </p>
            </section>

            {error && <p className="text-sm text-destructive">{error}</p>}

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
                        onClick={() => confirmMutation.mutate()}
                    >
                        {confirmMutation.isPending
                            ? "Starting…"
                            : `Pay ${intent.amount} ${intent.currency}`}
                    </Button>
                </>
            ) : (
                <p className="text-muted-foreground">
                    Waiting for you to approve the mobile money prompt on your phone…
                </p>
            )}
        </div>
    )
}
