import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { consentClientQueryOptions, consentSearchSchema, useSubmitConsent } from "@/kit/auth"

export const Route = createFileRoute("/_auth/consent")({
    validateSearch: consentSearchSchema,
    loaderDeps: ({ search }) => ({ clientId: search.client_id }),
    loader: async ({ context: { q, session }, deps, location }) => {
        if (!session) {
            // forward the whole signed authorize query verbatim (not just
            // client_id) — /sign-in needs every field, including `sig`, to
            // continue the flow after signing in. A relative href is fine:
            // redirect() only sets it as the Location header, no URL base
            // needed (importing cloudflare:workers's env here would leak
            // Workers-only code into the client bundle)
            throw redirect({
                href: `/sign-in${location.searchStr}`,
                replace: true,
            })
        }
        if (!deps.clientId) return { client: null }
        const client = await q.ensureQueryData(consentClientQueryOptions(deps.clientId))
        return { client }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { client } = Route.useLoaderData()
    const { mutateAsync: submitConsent, isPending } = useSubmitConsent()
    const [decision, setDecision] = useState<"accept" | "deny" | null>(null)

    async function respond(accept: boolean) {
        setDecision(accept ? "accept" : "deny")
        const search = window.location.search
        const oauthQuery = search.length > 1 ? search.slice(1) : undefined
        const result = await submitConsent({ data: { accept, oauthQuery } })
        window.location.href = result.redirectUri
    }

    return (
        <div className="container m-auto flex w-full max-w-md flex-col gap-5 py-10">
            <section>
                <h1 className="text-3xl">Authorize application</h1>
                <p className="text-muted-foreground">
                    <span className="text-foreground">{client?.name ?? "An application"}</span> is requesting
                    access to your account{client?.uri ? ` (${client.uri})` : ""}.
                </p>
            </section>

            <div className="flex gap-2">
                <Button type="button" isDisabled={isPending} onClick={() => void respond(true)}>
                    {isPending && decision === "accept" ? "Authorizing…" : "Allow"}
                </Button>
                <Button type="button" variant="outline" isDisabled={isPending} onClick={() => void respond(false)}>
                    {isPending && decision === "deny" ? "Denying…" : "Deny"}
                </Button>
            </div>
        </div>
    )
}
