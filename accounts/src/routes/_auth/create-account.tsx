import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { authClient } from "@/lib/auth-client"
import { m } from "../../paraglide/messages"

export const Route = createFileRoute("/_auth/create-account")(
    {
        loader: async ({ context: { session } }) => {
            if (session) {
                throw redirect({
                    to: "/",
                    replace: true,
                })
            }
        },
        component: RouteComponent,
    }
)

function RouteComponent() {
    const createAccountSchema = z.object({
        name: z
            .string()
            .min(1, m["auth.createAccount.nameRequired"]()),
        email: z.email(m["auth.common.email.invalid"]()),
        password: z
            .string()
            .min(8, m["auth.common.password.tooShort"]())
            .max(48, m["auth.common.password.tooLong"]()),
    })

    const [error, setError] = useState<string | null>(null)
    const [needsVerification, setNeedsVerification] =
        useState(false)

    const form = useAppForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        validators: {
            onChange: createAccountSchema,
        },
        onSubmit: async ({ value }) => {
            setError(null)
            const { data, error: signUpError } =
                await authClient.signUp.email({
                    name: value.name,
                    email: value.email,
                    password: value.password,
                    callbackURL: "/sign-in",
                })
            if (signUpError) {
                setError(
                    signUpError.message ??
                        m[
                            "auth.createAccount.errorFallback"
                        ]()
                )
                return
            }
            const token = (
                data as { token?: string | null } | undefined
            )?.token
            if (!token) {
                setNeedsVerification(true)
                return
            }
            const redirectUri = (
                data as { redirect_uri?: string } | undefined
            )?.redirect_uri
            window.location.href = redirectUri ?? "/"
        },
    })

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title={
                        needsVerification
                            ? m[
                                  "auth.createAccount.checkEmailTitle"
                              ]()
                            : m["auth.createAccount.title"]()
                    }
                    description={
                        needsVerification
                            ? m[
                                  "auth.createAccount.checkEmailDescription"
                              ]()
                            : undefined
                    }
                />
            }
        >
            {!needsVerification && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        void form.handleSubmit()
                    }}
                    className="flex flex-col gap-5"
                >
                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <form.AppForm>
                        <FieldGroup>
                            <form.AppField
                                name="name"
                                children={(field) => (
                                    <field.input
                                        label={m[
                                            "auth.createAccount.nameLabel"
                                        ]()}
                                        autoComplete="name"
                                        placeholder={m[
                                            "auth.createAccount.namePlaceholder"
                                        ]()}
                                    />
                                )}
                            />

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
                                        autoComplete="new-password"
                                        placeholder={m[
                                            "auth.common.password.tooShort"
                                        ]()}
                                    />
                                )}
                            />
                        </FieldGroup>

                        <form.submit
                            label={m[
                                "auth.createAccount.submit"
                            ]()}
                        />
                    </form.AppForm>

                    <p className="text-sm text-muted-foreground">
                        {m[
                            "auth.createAccount.alreadyHaveAccount"
                        ]()}
                        <Link
                            to="/sign-in"
                            className="text-foreground hover:underline"
                        >
                            {m["auth.signIn.title"]()}
                        </Link>
                    </p>
                </form>
            )}
        </ViewController>
    )
}
