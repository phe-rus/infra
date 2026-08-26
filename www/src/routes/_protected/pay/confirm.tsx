import { createFileRoute, redirect, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { Button } from "@infra/ui/components/button"
import { CountryProviderFields } from "@infra/ui/widgets/country-provider-fields"
import { authClient } from "@/lib/auth-client"
import { useWalletFields } from "@/features/payments/use-wallet-fields"

const searchSchema = z.object({ intent: z.string() })

// polling is customer-facing and runs on every single checkout, so it needs
// a real ceiling: fast at first (a normal mobile-money approval resolves in
// seconds), backing off after a bit, and giving up well before "forever" if
// the customer walks away without approving on their phone
const FAST_POLL_MS = 2000
const SLOW_POLL_MS = 5000
const FAST_POLL_WINDOW_MS = 20_000
const POLL_TIMEOUT_MS = 3 * 60 * 1000

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
    const [pollStartedAt, setPollStartedAt] = useState<number | null>(null)
    const [timedOut, setTimedOut] = useState(false)

    const { data, refetch } = useQuery({
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
            if (!status || status === "created" || status === "completed" || status === "failed") {
                return false
            }
            if (timedOut) return false
            const elapsed = Date.now() - (pollStartedAt ?? Date.now())
            return elapsed < FAST_POLL_WINDOW_MS ? FAST_POLL_MS : SLOW_POLL_MS
        },
    })

    // marks when active waiting actually began (right after confirming),
    // not when the page loaded, so the timeout window reflects real wait time
    useEffect(() => {
        if (data?.intent.status === "pending" && pollStartedAt === null) {
            setPollStartedAt(Date.now())
        }
    }, [data, pollStartedAt])

    useEffect(() => {
        if (pollStartedAt === null || timedOut) return
        const remaining = POLL_TIMEOUT_MS - (Date.now() - pollStartedAt)
        const timer = setTimeout(() => setTimedOut(true), Math.max(0, remaining))
        return () => clearTimeout(timer)
    }, [pollStartedAt, timedOut])

    const handleCheckAgain = () => {
        setTimedOut(false)
        setPollStartedAt(Date.now())
        void refetch()
    }

    // once PawaPay resolves it, infra hands back a signed token alongside
    // the terminal status: that's the whole point of this page. The
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
        onSuccess: () => refetch(),
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
        </div>
    )
}
