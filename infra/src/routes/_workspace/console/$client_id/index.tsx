import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { formatUtc } from "@infra/ui/lib/date"
import { Badge } from "@infra/ui/components/badge"
import { Button } from "@infra/ui/components/button"
import { Separator } from "@infra/ui/components/separator"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ApplicationFormFields } from "@/domains/console"
import { t } from "@infra/ui/components/sonner"
import {
    appDetailSearchSchema,
    appFormSchema,
    computeChangedFields,
    CREATE_CLIENT_ID,
    CREATE_DEFAULT_VALUES,
    editDefaultValues,
    infraConfigSnippet,
    useApp,
    useCreateApp,
    useRemoveApp,
    useRotateApp,
    useSetAppActive,
    useUpdateApp,
} from "@/domains/console"
import { ViewController } from "@infra/ui/widgets/view-controller"

export const Route = createFileRoute("/_workspace/console/$client_id/")({
    validateSearch: appDetailSearchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const { client_id: clientId } = Route.useParams()
    const { secret } = Route.useSearch()
    const navigate = Route.useNavigate()

    const isCreate = clientId === CREATE_CLIENT_ID
    const { data: application } = useApp(clientId)

    const { mutateAsync: createApp } = useCreateApp()
    const { mutateAsync: updateApp } = useUpdateApp()
    const { mutateAsync: rotateApp, isPending: isRotating } = useRotateApp()
    const { mutateAsync: removeApp } = useRemoveApp()
    const { mutateAsync: setActive } = useSetAppActive()

    const [revealedSecret, setRevealedSecret] = useState<string | null>(
        secret ?? null
    )
    useEffect(() => {
        if (secret) void navigate({ search: {}, replace: true })
    }, [secret, navigate])

    const form = useAppForm({
        defaultValues: isCreate
            ? CREATE_DEFAULT_VALUES
            : editDefaultValues(application),
        validators: { onChange: appFormSchema },
        onSubmit: async ({ value }) => {
            const redirectUris =
                value.redirect_uris
                    ?.split(",")
                    .map((u) => u.trim())
                    .filter(Boolean) ?? []
            const postLogoutRedirectUris = value.post_logout_redirect_uris
                ?.split(",")
                .map((u) => u.trim())
                .filter(Boolean)

            if (isCreate) {
                const result = await createApp({
                    data: {
                        client_name: value.client_name,
                        client_uri: value.client_uri || undefined,
                        logo_uri: value.logo_uri || undefined,
                        framework: value.framework,
                        application_type: value.application_type,
                        token_endpoint_auth_method:
                            value.token_endpoint_auth_method,
                        redirect_uris: redirectUris,
                        post_logout_redirect_uris:
                            postLogoutRedirectUris?.length
                                ? postLogoutRedirectUris
                                : undefined,
                        scope: value.scope,
                        grant_types: value.grant_types,
                        require_pkce: value.require_pkce,
                        skip_consent: value.skip_consent,
                        enable_end_session: value.enable_end_session,
                    },
                }).catch(() => null)
                if (!result) return

                void navigate({
                    to: "/console/$client_id",
                    params: { client_id: result.clientId },
                    search: { secret: result.clientSecret ?? undefined },
                    replace: true,
                })
                return
            }

            if (!application) return

            const changed = computeChangedFields(
                value,
                application,
                redirectUris,
                postLogoutRedirectUris
            )

            if (Object.keys(changed).length === 0) {
                t.info("No changes to save")
                return
            }

            await updateApp({ data: { clientId, ...changed } }).catch(
                () => null
            )
        },
    })

    async function handleRotate() {
        const result = await rotateApp({ data: { clientId } })
        setRevealedSecret(result.clientSecret)
    }

    async function handleRemove() {
        await removeApp({ data: { clientId } })
        void navigate({ to: "/console" })
    }

    const snippet = revealedSecret
        ? infraConfigSnippet(clientId, revealedSecret)
        : null

    return (
        <ViewController
            heading={
                <ViewController.Heading
                    title={isCreate ? "Create application" : "Edit application"}
                    description={
                        isCreate
                            ? "Register a new OAuth 2.1 client."
                            : "Manage this OAuth 2.1 application."
                    }
                />
            }
        >
            {snippet && (
                <section className="flex flex-col gap-2 rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                        The client secret is only shown once — copy it now, it
                        can't be retrieved again.
                    </p>
                    <pre className="rounded bg-muted p-3 text-xs break-all whitespace-pre-wrap">
                        {snippet}
                    </pre>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-fit"
                        onClick={() =>
                            void navigator.clipboard.writeText(snippet)
                        }
                    >
                        Copy infraConfig
                    </Button>
                </section>
            )}

            {!isCreate && application && (
                <section className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        Client ID:{" "}
                        <code className="text-foreground">
                            {application.clientId}
                        </code>
                        <button
                            type="button"
                            onClick={() =>
                                void navigator.clipboard.writeText(
                                    application.clientId
                                )
                            }
                            aria-label="Copy client ID"
                        >
                            <HugeiconsIcon icon={Copy01Icon} className="size-3" />
                        </button>
                    </div>
                    <div>
                        Created{" "}
                        {application.createdAt
                            ? formatUtc(application.createdAt, "PPPp")
                            : "—"}
                    </div>
                    <div>
                        Updated{" "}
                        {application.updatedAt
                            ? formatUtc(application.updatedAt, "PPPp")
                            : "—"}
                    </div>
                    <Badge
                        variant={
                            application.disabled ? "destructive" : "outline"
                        }
                        className="w-fit"
                    >
                        {application.disabled ? "Disabled" : "Active"}
                    </Badge>
                </section>
            )}

            <Separator />

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                className="flex flex-col gap-5"
            >
                <form.AppForm>
                    <ApplicationFormFields form={form} isCreate={isCreate} />
                    <form.submit
                        label={isCreate ? "Create application" : "Save changes"}
                    />
                </form.AppForm>
            </form>

            {!isCreate && application && (
                <>
                    <Separator />
                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Admin actions</h3>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    void setActive({
                                        data: {
                                            clientId,
                                            active: Boolean(
                                                application.disabled
                                            ),
                                        },
                                    })
                                }
                            >
                                {application.disabled ? "Enable" : "Disable"}
                            </Button>
                            {application.isOwnClient && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isRotating}
                                    onClick={() => void handleRotate()}
                                >
                                    Rotate secret
                                </Button>
                            )}
                            {application.isOwnClient && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => void handleRemove()}
                                >
                                    Remove application
                                </Button>
                            )}
                        </div>
                    </section>
                </>
            )}
        </ViewController>
    )
}
