import { createFileRoute, redirect, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"
import { Button } from "@infra/ui/components/button"
import { authClient } from "@/lib/auth-client"

const consentSearchSchema = z.object({
    client_id: z.string().optional(),
})

export const Route = createFileRoute("/consent")({
    validateSearch: consentSearchSchema,
    beforeLoad: async ({ location }) => {
        const { data: session } = await authClient.getSession()
        if (!session) {
            throw redirect({
                href: `/sign-in${location.searchStr}`,
                replace: true,
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { client_id } = useSearch({ from: "/consent" })
    const [client, setClient] = useState<{ client_name?: string; client_uri?: string } | null>(null)
    const [decision, setDecision] = useState<"accept" | "deny" | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!client_id) return
        void authClient.oauth2.publicClient({ query: { client_id } }).then(({ data }) => {
            if (data) setClient(data)
        })
    }, [client_id])

    async function respond(accept: boolean) {
        setError(null)
        setDecision(accept ? "accept" : "deny")
        const { data, error: consentError } = await authClient.oauth2.consent({ accept })
        if (consentError) {
            setError(consentError.message ?? "Unable to submit consent")
            setDecision(null)
            return
        }
        window.location.href = (data as { url: string }).url
    }

    return (
        <div className="container m-auto flex w-full max-w-md flex-col gap-5 py-10">
            <section>
                <h1 className="text-3xl">Authorize application</h1>
                <p className="text-muted-foreground">
                    <span className="text-foreground">
                        {client?.client_name ?? "An application"}
                    </span>{" "}
                    is requesting access to your account
                    {client?.client_uri ? ` (${client.client_uri})` : ""}.
                </p>
            </section>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
                <Button
                    type="button"
                    isDisabled={decision !== null}
                    onClick={() => void respond(true)}
                >
                    {decision === "accept" ? "Authorizing…" : "Allow"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    isDisabled={decision !== null}
                    onClick={() => void respond(false)}
                >
                    {decision === "deny" ? "Denying…" : "Deny"}
                </Button>
            </div>
        </div>
    )
}
