import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/ui/field"
import { Button } from "@infra/ui/components/ui/button"
import { useAppForm } from "@infra/ui/components/widgets/blocks"
import { cn } from "@infra/ui/lib/utils"
import { authClient } from "@/lib/auth-client"

const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
})

export const Route = createFileRoute("/_auth/sign-in")({
    component: RouteComponent,
})

function continueOrGoHome(data: unknown) {
    const redirectUri = (data as { redirect_uri?: string } | undefined)?.redirect_uri
    window.location.href = redirectUri ?? "/"
}

function RouteComponent() {
    const [error, setError] = useState<string | null>(null)
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
            setError(null)
            const { data, error: signInError } = await authClient.signIn.email({
                email: value.email,
                password: value.password,
                rememberMe: value.rememberMe,
            })
            if (signInError) {
                setError(signInError.message ?? "Unable to sign in")
                return
            }
            continueOrGoHome(data)
        },
    })

    async function signInWithPasskey() {
        setError(null)
        setPasskeyPending(true)
        const { data, error: passkeyError } = await authClient.signIn.passkey()
        setPasskeyPending(false)
        if (passkeyError) {
            setError(passkeyError.message ?? "Unable to sign in with passkey")
            return
        }
        continueOrGoHome(data)
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className={cn("flex w-full md:max-w-md flex-col gap-5", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Sign in</h1>
                <p className="text-muted-foreground">Sign in to your account</p>
            </section>

            {error && <p className="text-sm text-destructive">{error}</p>}

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

                    <form.AppField
                        name="rememberMe"
                        children={(field) => <field.checkbox label="Remember me" />}
                    />
                </FieldGroup>

                <form.submit label="Sign in" />
            </form.AppForm>

            <Button type="button" variant="outline" isDisabled={passkeyPending} onClick={() => void signInWithPasskey()}>
                {passkeyPending ? "Waiting for passkey…" : "Sign in with a passkey"}
            </Button>

            <p className="text-muted-foreground text-sm">
                No account?{" "}
                <Link to="/create-account" className="text-foreground hover:underline">
                    Create one
                </Link>
            </p>
        </form>
    )
}
