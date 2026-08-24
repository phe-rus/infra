import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { IconCopy } from "@tabler/icons-react"
import { formatUtc } from "@infra/ui/lib/date"
import type { z } from "zod"
import { Badge } from "@infra/ui/components/badge"
import { Button } from "@infra/ui/components/button"
import { Separator } from "@infra/ui/components/separator"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ApplicationFormFields } from "@/features/console"
import { t } from "@infra/ui/components/sonner"
import {
    appDetailSearchSchema,
    appFormSchema,
    appOptions,
    CREATE_CLIENT_ID,
    useCreateApp,
    useRemoveApp,
    useRotateApp,
    useSetAppActive,
    useUpdateApp,
} from "@/kit/console"
import type {
    AppDetail,
    ClientType,
    Framework,
    GrantType,
    Scope,
    TokenEndpointAuthMethod,
} from "@/kit/console"

export const Route = createFileRoute("/_workspace/console/$client_id/")({
    validateSearch: appDetailSearchSchema,
    component: RouteComponent,
})

function infraConfigSnippet(clientId: string, clientSecret: string | null): string {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    return `const infraConfig = {
  clientId: "${clientId}",
  ${clientSecret ? `clientSecret: "${clientSecret}", // shown once, copy it now\n  ` : ""}authUrl: "${origin}/api/auth",
}`
}

const CREATE_DEFAULT_VALUES: z.input<typeof appFormSchema> = {
    client_name: "",
    client_uri: "",
    logo_uri: "",
    framework: undefined,
    application_type: "native",
    token_endpoint_auth_method: "none",
    redirect_uris: "",
    post_logout_redirect_uris: "",
    scope: ["openid", "profile", "email"],
    grant_types: ["authorization_code"],
    require_pkce: true,
    skip_consent: false,
    enable_end_session: false,
}

function editDefaultValues(application: AppDetail | undefined): z.input<typeof appFormSchema> {
    return {
        client_name: application?.name ?? "",
        client_uri: application?.uri ?? "",
        logo_uri: application?.icon ?? "",
        framework: (application?.framework as Framework | undefined) ?? undefined,
        application_type: (application?.applicationType as ClientType | undefined) ?? "native",
        token_endpoint_auth_method:
            (application?.tokenEndpointAuthMethod as TokenEndpointAuthMethod | undefined) ?? "none",
        redirect_uris: (application?.redirectUris ?? []).join(","),
        post_logout_redirect_uris: (application?.postLogoutRedirectUris ?? []).join(","),
        scope: (application?.scopes as Scope[] | undefined) ?? [],
        grant_types: (application?.grantTypes as GrantType[] | undefined) ?? [],
        require_pkce: Boolean(application?.requirePKCE),
        skip_consent: Boolean(application?.skipConsent),
        enable_end_session: Boolean(application?.enableEndSession),
    }
}

type ChangedFields = Partial<{
    client_name: string
    client_uri: string
    logo_uri: string
    framework: Framework
    redirect_uris: string[]
    post_logout_redirect_uris: string[]
    scope: Scope[]
    grant_types: GrantType[]
    skip_consent: boolean
    enable_end_session: boolean
}>

// only the fields that actually differ from the application's current
// values — updateApp should send a targeted patch, not the whole form
function computeChangedFields(
    value: z.input<typeof appFormSchema>,
    application: NonNullable<AppDetail>,
    redirectUris: string[],
    postLogoutRedirectUris: string[] | undefined
): ChangedFields {
    return {
        ...(value.client_name !== application.name && { client_name: value.client_name }),
        ...((value.client_uri || undefined) !== (application.uri ?? undefined) && {
            client_uri: value.client_uri || undefined,
        }),
        ...((value.logo_uri || undefined) !== (application.icon ?? undefined) && {
            logo_uri: value.logo_uri || undefined,
        }),
        ...(value.framework !== (application.framework ?? undefined) &&
            value.framework && { framework: value.framework }),
        ...(JSON.stringify(redirectUris) !== JSON.stringify(application.redirectUris) && {
            redirect_uris: redirectUris,
        }),
        ...(JSON.stringify(postLogoutRedirectUris ?? []) !==
            JSON.stringify(application.postLogoutRedirectUris) && {
            post_logout_redirect_uris: postLogoutRedirectUris,
        }),
        ...(JSON.stringify([...value.scope].sort()) !==
            JSON.stringify([...application.scopes].sort()) && {
            scope: value.scope,
        }),
        ...(JSON.stringify([...value.grant_types].sort()) !==
            JSON.stringify([...application.grantTypes].sort()) && {
            grant_types: value.grant_types,
        }),
        ...(value.skip_consent !== Boolean(application.skipConsent) && {
            skip_consent: value.skip_consent,
        }),
        ...(value.enable_end_session !== Boolean(application.enableEndSession) && {
            enable_end_session: value.enable_end_session,
        }),
    }
}

function RouteComponent() {
    const { client_id: clientId } = Route.useParams()
    const { secret } = Route.useSearch()
    const navigate = Route.useNavigate()

    const isCreate = clientId === CREATE_CLIENT_ID
    // findApp cleanly returns null for the create-oauth2 sentinel (no such
    // client will ever exist), so this can run unconditionally — matches
    // the project's loader-ensureQueryData + useSuspenseQuery convention
    // rather than Route.useLoaderData(), since a mutation (update/rotate/
    // enable-disable) can change this data while the page stays open
    const { data: application } = useSuspenseQuery(appOptions(clientId))

    const { mutateAsync: createApp } = useCreateApp()
    const { mutateAsync: updateApp } = useUpdateApp()
    const { mutateAsync: rotateApp, isPending: isRotating } = useRotateApp()
    const { mutateAsync: removeApp } = useRemoveApp()
    const { mutateAsync: setActive } = useSetAppActive()

    const [revealedSecret, setRevealedSecret] = useState<string | null>(secret ?? null)

    // one-time secret shown once via the ?secret= search param right after
    // creation — read it into local state, then clear it from the URL so
    // it doesn't linger in browser history
    useEffect(() => {
        if (secret) void navigate({ search: {}, replace: true })
    }, [secret, navigate])

    const form = useAppForm({
        defaultValues: isCreate ? CREATE_DEFAULT_VALUES : editDefaultValues(application),
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
                // useAppMutation's onError already reports failures via toast —
                // this just stops the rejection from also surfacing as an
                // unhandled promise rejection in the console
                const result = await createApp({
                    data: {
                        client_name: value.client_name,
                        client_uri: value.client_uri || undefined,
                        logo_uri: value.logo_uri || undefined,
                        framework: value.framework,
                        application_type: value.application_type,
                        token_endpoint_auth_method: value.token_endpoint_auth_method,
                        redirect_uris: redirectUris,
                        post_logout_redirect_uris: postLogoutRedirectUris?.length
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

            await updateApp({ data: { clientId, ...changed } }).catch(() => null)
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

    const snippet = revealedSecret ? infraConfigSnippet(clientId, revealedSecret) : null

    return (
        <article className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-3xl">
            <section>
                <h1 className="text-3xl md:text-4xl">
                    {isCreate ? "Create application" : "Edit application"}
                </h1>
                <p className="text-muted-foreground">
                    {isCreate
                        ? "Register a new OAuth 2.1 client."
                        : "Manage this OAuth 2.1 application."}
                </p>
            </section>

            {snippet && (
                <section className="flex flex-col gap-2 rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                        The client secret is only shown once — copy it now, it can't be retrieved
                        again.
                    </p>
                    <pre className="rounded bg-muted p-3 text-xs break-all whitespace-pre-wrap">
                        {snippet}
                    </pre>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-fit"
                        onClick={() => void navigator.clipboard.writeText(snippet)}
                    >
                        Copy infraConfig
                    </Button>
                </section>
            )}

            {!isCreate && application && (
                <section className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        Client ID: <code className="text-foreground">{application.clientId}</code>
                        <button
                            type="button"
                            onClick={() => void navigator.clipboard.writeText(application.clientId)}
                            aria-label="Copy client ID"
                        >
                            <IconCopy className="size-3" />
                        </button>
                    </div>
                    <div>Created {formatUtc(application.createdAt, "PPPp")}</div>
                    <div>Updated {formatUtc(application.updatedAt, "PPPp")}</div>
                    <Badge
                        variant={application.disabled ? "destructive" : "outline"}
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
                    <form.submit label={isCreate ? "Create application" : "Save changes"} />
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
                                        data: { clientId, active: Boolean(application.disabled) },
                                    })
                                }
                            >
                                {application.disabled ? "Enable" : "Disable"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                isDisabled={isRotating}
                                onClick={() => void handleRotate()}
                            >
                                Rotate secret
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => void handleRemove()}
                            >
                                Remove application
                            </Button>
                        </div>
                    </section>
                </>
            )}
        </article>
    )
}
