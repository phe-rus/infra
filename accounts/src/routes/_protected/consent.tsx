import { createFileRoute, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { z } from "zod"
import { Button } from "@infra/ui/components/button"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { authClient } from "@/lib/auth-client"

const consentSearchSchema = z.object({
    client_id: z.string().optional(),
})

export const Route = createFileRoute("/_protected/consent")({
    validateSearch: consentSearchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const { client_id } = useSearch({ from: "/_protected/consent" })
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
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Authorize application"
                    description={
                        <>
                            <span className="text-foreground">
                                {client?.client_name ?? "An application"}
                            </span>{" "}
                            is requesting access to your account
                            {client?.client_uri ? ` (${client.client_uri})` : ""}.
                        </>
                    }
                />
            }
        >
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
        </ViewController>
    )
}
