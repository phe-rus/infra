import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { cn } from "@infra/ui/lib/utils"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/_auth/create-account")({
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

const createAccountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(48, "At most 48 characters"),
})

function RouteComponent() {
    const [error, setError] = useState<string | null>(null)
    const [needsVerification, setNeedsVerification] = useState(false)

    const form = useAppForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        } as z.input<typeof createAccountSchema>,
        validators: {
            onChange: createAccountSchema,
        },
        onSubmit: async ({ value }) => {
            setError(null)
            const { data, error: signUpError } = await authClient.signUp.email({
                name: value.name,
                email: value.email,
                password: value.password,
                // where the verification email's link lands after
                // confirming — no in-progress state worth resuming, just
                // send them to sign in
                callbackURL: "/sign-in",
            })
            if (signUpError) {
                setError(signUpError.message ?? "Unable to create account")
                return
            }
            // requireEmailVerification withholds the session (token: null)
            // until the address is confirmed
            const token = (data as { token?: string | null } | undefined)?.token
            if (!token) {
                setNeedsVerification(true)
                return
            }
            const redirectUri = (data as { redirect_uri?: string } | undefined)?.redirect_uri
            window.location.href = redirectUri ?? "/"
        },
    })

    if (needsVerification) {
        return (
            <div className={cn("flex w-full flex-col gap-5 md:max-w-md", "container m-auto py-10")}>
                <h1 className="text-3xl">Check your email</h1>
                <p className="text-muted-foreground">
                    We sent a verification link to your email address. Follow it to finish creating
                    your account.
                </p>
            </div>
        )
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className={cn("flex w-full flex-col gap-5 md:max-w-md", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Create an account</h1>
            </section>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <form.AppForm>
                <FieldGroup>
                    <form.AppField
                        name="name"
                        children={(field) => (
                            <field.input label="Name" autoComplete="name" placeholder="Your name" />
                        )}
                    />

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
                                autoComplete="new-password"
                                placeholder="At least 8 characters"
                            />
                        )}
                    />
                </FieldGroup>

                <form.submit label="Create account" />
            </form.AppForm>

            <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-foreground hover:underline">
                    Sign in
                </Link>
            </p>
        </form>
    )
}
