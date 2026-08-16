import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { IconCopy } from "@tabler/icons-react"
import { format } from "date-fns/format"
import type { z } from "zod"
import { Badge } from "@infra/ui/components/ui/badge"
import { Button } from "@infra/ui/components/ui/button"
import { FieldGroup } from "@infra/ui/components/ui/field"
import { Separator } from "@infra/ui/components/ui/separator"
import { useAppForm } from "@infra/ui/components/widgets/blocks"
import { FrameworkIcon } from "@/components/widgets/framework-icon"
import { t } from "@infra/ui/components/ui/sonner"
import {
    appDetailSearchSchema,
    appFormSchema,
    appOptions,
    CLIENT_TYPE_INFO,
    CLIENT_TYPES,
    CREATE_CLIENT_ID,
    FRAMEWORK_LABELS,
    FRAMEWORKS,
    GRANT_TYPE_OPTIONS,
    SCOPE_OPTIONS,
    TOKEN_ENDPOINT_AUTH_METHOD_INFO,
    TOKEN_ENDPOINT_AUTH_METHODS,
    type ClientType,
    type Framework,
    type GrantType,
    type Scope,
    type TokenEndpointAuthMethod,
    useCreateApp,
    useRemoveApp,
    useRotateApp,
    useSetAppActive,
    useUpdateApp,
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

    const defaultValues: z.input<typeof appFormSchema> = isCreate
        ? {
              client_name: "",
              client_uri: "",
              logo_uri: "",
              framework: undefined,
              type: "user-agent-based",
              token_endpoint_auth_method: "none",
              redirect_uris: "",
              post_logout_redirect_uris: "",
              scope: ["openid", "profile", "email"],
              grant_types: ["authorization_code"],
              require_pkce: true,
              skip_consent: false,
              enable_end_session: false,
          }
        : {
              client_name: application?.name ?? "",
              client_uri: application?.uri ?? "",
              logo_uri: application?.icon ?? "",
              framework: (application?.framework as Framework | undefined) ?? undefined,
              type: (application?.type as ClientType | undefined) ?? "user-agent-based",
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

    const form = useAppForm({
        defaultValues,
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
                        type: value.type,
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
                })
                void navigate({
                    to: "/console/$client_id",
                    params: { client_id: result.clientId },
                    search: { secret: result.clientSecret ?? undefined },
                    replace: true,
                })
                return
            }

            if (!application) return

            const changed: Partial<{
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
            }> = {
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
                ...(JSON.stringify([...value.scope].sort()) !== JSON.stringify([...application.scopes].sort()) && {
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

            if (Object.keys(changed).length === 0) {
                t.info("No changes to save")
                return
            }

            await updateApp({ data: { clientId, ...changed } })
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
                <h1 className="text-3xl md:text-4xl">{isCreate ? "Create application" : "Edit application"}</h1>
                <p className="text-muted-foreground">
                    {isCreate ? "Register a new OAuth 2.1 client." : "Manage this OAuth 2.1 application."}
                </p>
            </section>

            {snippet && (
                <section className="flex flex-col gap-2 rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                        The client secret is only shown once — copy it now, it can't be retrieved again.
                    </p>
                    <pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">{snippet}</pre>
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
                    <div>Created {format(application.createdAt, "PPPp")}</div>
                    <div>Updated {format(application.updatedAt, "PPPp")}</div>
                    <Badge variant={application.disabled ? "destructive" : "outline"} className="w-fit">
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
                    <FieldGroup className="grid grid-cols-1 gap-4">
                        <form.AppField
                            name="client_name"
                            children={(field) => <field.input label="Name" placeholder="My Application" />}
                        />

                        <form.AppField
                            name="client_uri"
                            children={(field) => (
                                <field.input label="Application homepage URI (optional)" placeholder="https://www.example.com" />
                            )}
                        />

                        <form.AppField
                            name="logo_uri"
                            children={(field) => (
                                <field.input label="Logo URI (optional)" placeholder="https://www.example.com/logo.png" />
                            )}
                        />

                        <form.AppField
                            name="framework"
                            children={(field) => (
                                <field.radioCard
                                    label="Framework (optional)"
                                    description="Used to pick a display icon — has no effect on how the client behaves."
                                    columns={2}
                                    options={FRAMEWORKS.filter((f) => f !== "other").map((framework) => ({
                                        value: framework,
                                        label: FRAMEWORK_LABELS[framework],
                                        icon: <FrameworkIcon framework={framework} className="size-4" />,
                                    }))}
                                />
                            )}
                        />

                        <form.AppField
                            name="type"
                            children={(field) => (
                                <field.radioCard
                                    label="Type"
                                    disabled={!isCreate}
                                    columns={2}
                                    description={
                                        isCreate ? "You can't change this later." : "This can't be edited after creation."
                                    }
                                    options={CLIENT_TYPES.map((type) => ({ value: type, ...CLIENT_TYPE_INFO[type] }))}
                                />
                            )}
                        />

                        <form.AppField
                            name="token_endpoint_auth_method"
                            children={(field) => (
                                <field.radioCard
                                    label="Client confidentiality"
                                    disabled={!isCreate}
                                    description={
                                        isCreate ? "You can't change this later." : "This can't be edited after creation."
                                    }
                                    options={TOKEN_ENDPOINT_AUTH_METHODS.map((method) => ({
                                        value: method,
                                        ...TOKEN_ENDPOINT_AUTH_METHOD_INFO[method],
                                    }))}
                                />
                            )}
                        />

                        <form.AppField
                            name="redirect_uris"
                            children={(field) => (
                                <field.textarea
                                    label="Allowed callback URLs (optional)"
                                    placeholder="https://myapp.com/callback, https://myapp.com/auth"
                                />
                            )}
                        />

                        <form.AppField
                            name="post_logout_redirect_uris"
                            children={(field) => (
                                <field.textarea
                                    label="Allowed logout redirect URLs (optional)"
                                    placeholder="https://myapp.com, https://myapp.com/signed-out"
                                />
                            )}
                        />

                        <form.AppField
                            name="grant_types"
                            children={(field) => <field.multiselect label="Grant types" options={GRANT_TYPE_OPTIONS} />}
                        />

                        <form.AppField
                            name="scope"
                            children={(field) => <field.multiselect label="Scopes" options={SCOPE_OPTIONS} />}
                        />

                        <form.AppField
                            name="require_pkce"
                            children={(field) => (
                                <field.switch
                                    label="Require PKCE"
                                    disabled={!isCreate}
                                    description={isCreate ? undefined : "This can't be edited after creation."}
                                />
                            )}
                        />

                        <form.AppField
                            name="skip_consent"
                            children={(field) => (
                                <field.switch label="Skip consent screen" description="Trusted clients only." />
                            )}
                        />

                        <form.AppField
                            name="enable_end_session"
                            children={(field) => (
                                <field.switch
                                    label="Enable end session"
                                    description="RP-initiated logout (OIDC front-channel/back-channel logout)."
                                />
                            )}
                        />
                    </FieldGroup>

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
                            <Button type="button" variant="outline" isDisabled={isRotating} onClick={() => void handleRotate()}>
                                Rotate secret
                            </Button>
                            <Button type="button" variant="destructive" onClick={() => void handleRemove()}>
                                Remove application
                            </Button>
                        </div>
                    </section>
                </>
            )}
        </article>
    )
}
