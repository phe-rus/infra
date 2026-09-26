import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import {
    authClient,
    continueOrGoHome,
} from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"
import { m } from "../../paraglide/messages"

export const Route = createFileRoute("/_auth/sign-in")({
    loader: async ({ context: { session } }) => {
        if (session) {
            throw redirect({
                to: "/",
                replace: true,
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const [passkeyPending, setPasskeyPending] =
        useState(false)

    const signInSchema = z.object({
        email: z.email(m["auth.common.email.invalid"]()),
        password: z
            .string()
            .min(1, m["auth.signIn.passwordRequired"]()),
        rememberMe: z.boolean().optional(),
    })

    const form = useAppForm({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: true,
        } as z.input<typeof signInSchema>,
        validators: {
            onChange: signInSchema,
        },
        onSubmit: async ({ value }) => {
            const { data, error: signInError } =
                await authClient.signIn.email({
                    email: value.email,
                    password: value.password,
                    rememberMe: value.rememberMe,
                })
            if (signInError) {
                t.error(
                    signInError.message ??
                        m["auth.signIn.errorFallback"]()
                )
                return
            }
            continueOrGoHome(data)
        },
    })

    async function signInWithPasskey() {
        setPasskeyPending(true)
        const { data, error: passkeyError } =
            await authClient.signIn.passkey()
        setPasskeyPending(false)
        if (passkeyError) {
            t.error(
                passkeyError.message ??
                    m["auth.signIn.passkeyErrorFallback"]()
            )
            return
        }
        continueOrGoHome(data)
    }

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title={m["auth.signIn.title"]()}
                    description={m[
                        "auth.signIn.description"
                    ]()}
                />
            }
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="flex flex-col gap-5"
            >
                <form.AppForm>
                    <FieldGroup>
                        <form.AppField
                            name="email"
                            children={(field) => (
                                <field.input
                                    label={m[
                                        "auth.common.email.label"
                                    ]()}
                                    type="email"
                                    autoComplete="email"
                                    placeholder={m[
                                        "auth.common.email.placeholder"
                                    ]()}
                                />
                            )}
                        />

                        <form.AppField
                            name="password"
                            children={(field) => (
                                <field.input
                                    label={m[
                                        "auth.common.password.label"
                                    ]()}
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder={m[
                                        "auth.signIn.passwordPlaceholder"
                                    ]()}
                                />
                            )}
                        />

                        <div className="flex items-center justify-between truncate">
                            <form.AppField
                                name="rememberMe"
                                children={(field) => (
                                    <field.checkbox
                                        label={m[
                                            "auth.signIn.rememberMe"
                                        ]()}
                                    />
                                )}
                            />
                            <Link
                                to="/forgot-password"
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                {m[
                                    "auth.signIn.forgotPassword"
                                ]()}
                            </Link>
                        </div>
                    </FieldGroup>

                    <form.submit
                        label={m["auth.signIn.title"]()}
                    />
                </form.AppForm>

                <Button
                    type="button"
                    variant="outline"
                    disabled={passkeyPending}
                    onClick={() => void signInWithPasskey()}
                >
                    {passkeyPending
                        ? m["auth.signIn.passkeyWaiting"]()
                        : m["auth.signIn.passkeySignIn"]()}
                </Button>

                <p className="text-sm text-muted-foreground">
                    {m["auth.signIn.noAccount"]()}
                    <Link
                        to="/create-account"
                        className="text-foreground hover:underline"
                    >
                        {m["auth.signIn.createOne"]()}
                    </Link>
                </p>
            </form>
        </ViewController>
    )
}
