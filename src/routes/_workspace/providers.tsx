import { createFileRoute } from "@tanstack/react-router"
import {
    authSettingsQueryOptions,
    emailPasswordAuthSettingsQueryOptions,
    securityAuthSettingsQueryOptions,
    trustedOriginsQueryOptions,
} from "@/functions/settingsFn"
import { useUpdateProviderSettings } from "@/hooks/settingsHooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { METHOD_LABELS, TOGGLEABLE_METHODS } from "@/auth/settings/methods"
import { useAppForm } from "@/components/blocks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconPlus, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { z } from "zod"

const providersSettingsSchema = z.object({
    requireEmailVerification: z.boolean(),
    authMethods: z.record(z.string(), z.boolean()),
    useSecureCookies: z.boolean(),
    crossSubDomainCookies: z.boolean(),
    cookieDomain: z.string(),
    trustedOrigins: z.array(z.string().min(1)),
})

export const Route = createFileRoute("/_workspace/providers")({
    loader: async ({ context: { q } }) => {
        const [authMethods, emailPassword, security, trustedOrigins] = await Promise.all([
            q.ensureQueryData(authSettingsQueryOptions()),
            q.ensureQueryData(emailPasswordAuthSettingsQueryOptions()),
            q.ensureQueryData(securityAuthSettingsQueryOptions()),
            q.ensureQueryData(trustedOriginsQueryOptions()),
        ])
        return { authMethods, emailPassword, security, trustedOrigins }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { authMethods, emailPassword, security, trustedOrigins } = Route.useLoaderData()
    const [draftOrigin, setDraftOrigin] = useState("")
    const { mutateAsync: updateProviderSettings } = useUpdateProviderSettings()

    const form = useAppForm({
        defaultValues: {
            requireEmailVerification: emailPassword.requireEmailVerification,
            authMethods,
            useSecureCookies: security.useSecureCookies,
            crossSubDomainCookies: security.crossSubDomainCookies,
            cookieDomain: security.cookieDomain,
            trustedOrigins,
        },
        validators: {
            onChange: providersSettingsSchema,
        },
        onSubmit: async ({ value }) => {
            await updateProviderSettings(value)
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-2xl"
        >
            <section>
                <h1 className="text-3xl md:text-4xl">Providers</h1>
                <p className="text-muted-foreground">
                    The same settings you chose during setup. Change what's enabled and how sessions
                    are secured.
                </p>
            </section>

            <form.AppForm>
                <Card>
                    <CardHeader>
                        <CardTitle>Sign-in methods</CardTitle>
                        <CardDescription>
                            {METHOD_LABELS.emailAndPassword} is always on.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                            <form.AppField
                                name="requireEmailVerification"
                                children={(field) => (
                                    <field.checkbox label="Require email verification" />
                                )}
                            />
                            {TOGGLEABLE_METHODS.map((method) => (
                                <form.AppField
                                    key={method}
                                    name={`authMethods.${method}`}
                                    children={(field) => <field.checkbox label={METHOD_LABELS[method]} />}
                                />
                            ))}
                        </FieldGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>
                            Controls how session cookies are issued. Leave these off for a single-domain
                            setup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <form.AppField
                                name="useSecureCookies"
                                children={(field) => (
                                    <field.checkbox label="Use secure cookies (HTTPS only)" />
                                )}
                            />
                            <form.AppField
                                name="crossSubDomainCookies"
                                children={(field) => (
                                    <field.checkbox label="Share cookies across subdomains" />
                                )}
                            />
                            <form.Subscribe selector={(state) => state.values.crossSubDomainCookies}>
                                {(enabled) =>
                                    enabled && (
                                        <form.AppField
                                            name="cookieDomain"
                                            children={(field) => (
                                                <field.input label="Cookie domain" placeholder=".example.com" />
                                            )}
                                        />
                                    )
                                }
                            </form.Subscribe>
                        </FieldGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trusted origins</CardTitle>
                        <CardDescription>
                            Regex patterns matched against the hostname of incoming request origins.
                            Requests from origins that don't match any pattern fall back to the instance's
                            base URL.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <form.AppField
                            name="trustedOrigins"
                            children={(field) => (
                                <div className="flex flex-col gap-2">
                                    {field.state.value.map((pattern, index) => (
                                        <div key={`${pattern}-${index}`} className="flex items-center gap-2">
                                            <code className="flex-1 truncate rounded-none border border-input bg-input/30 px-2.5 py-1 text-xs">
                                                {pattern}
                                            </code>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label={`Remove ${pattern}`}
                                                onClick={() => field.removeValue(index)}
                                            >
                                                <IconX />
                                            </Button>
                                        </div>
                                    ))}

                                    <Field orientation="horizontal">
                                        <FieldLabel htmlFor="new-trusted-origin" className="sr-only">
                                            New trusted origin pattern
                                        </FieldLabel>
                                        <Input
                                            id="new-trusted-origin"
                                            className="flex-1"
                                            value={draftOrigin}
                                            onChange={(e) => setDraftOrigin(e.target.value)}
                                            placeholder={String.raw`^(.*\.)?example\.com$`}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            isDisabled={!draftOrigin.trim()}
                                            onClick={() => {
                                                field.pushValue(draftOrigin.trim())
                                                setDraftOrigin("")
                                            }}
                                        >
                                            <IconPlus /> Add
                                        </Button>
                                    </Field>
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                <div>
                    <form.submit label="Save changes" />
                </div>
            </form.AppForm>
        </form>
    )
}
