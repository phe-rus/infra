import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { Button } from "@infra/ui/components/button"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { authClient } from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"

const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
})

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

function continueOrGoHome(data: unknown) {
    const result = data as
        | { redirect_uri?: string; twoFactorRedirect?: boolean }
        | undefined
    if (result?.twoFactorRedirect) return
    window.location.href = result?.redirect_uri ?? "/"
}

function RouteComponent() {
    const [passkeyPending, setPasskeyPending] = useState(false)

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
                t.error(signInError.message ?? "Unable to sign in")
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
                passkeyError.message ?? "Unable to sign in with passkey"
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
                    title="Sign in"
                    description="Sign in to your account"
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
                                    label="Email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                />
                            )}
                        />

                        <form.AppField
                            name="password"
                            children={(field) => (
                                <field.input
                                    label="Password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                />
                            )}
                        />

                        <div className="flex items-center justify-between truncate">
                            <form.AppField
                                name="rememberMe"
                                children={(field) => (
                                    <field.checkbox label="Remember me" />
                                )}
                            />
                            <Link
                                to="/forgot-password"
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </FieldGroup>

                    <form.submit label="Sign in" />
                </form.AppForm>

                <Button
                    type="button"
                    variant="outline"
                    isDisabled={passkeyPending}
                    onClick={() => void signInWithPasskey()}
                >
                    {passkeyPending
                        ? "Waiting for passkey…"
                        : "Sign in with a passkey"}
                </Button>

                <p className="text-sm text-muted-foreground">
                    No account?{" "}
                    <Link
                        to="/create-account"
                        className="text-foreground hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </form>
        </ViewController>
    )
}
