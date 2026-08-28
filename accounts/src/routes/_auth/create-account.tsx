import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
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
    password: z
        .string()
        .min(8, "At least 8 characters")
        .max(48, "At most 48 characters"),
})

function RouteComponent() {
    const [error, setError] = useState<string | null>(null)
    const [needsVerification, setNeedsVerification] = useState(false)

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
                    signUpError.message ?? "Unable to create account"
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
                            ? "Check your email"
                            : "Create an account"
                    }
                    description={
                        needsVerification
                            ? "We sent a verification link to your email address. Follow it to finish creating your account."
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
                                        label="Name"
                                        autoComplete="name"
                                        placeholder="Your name"
                                    />
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
                        <Link
                            to="/sign-in"
                            className="text-foreground hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            )}
        </ViewController>
    )
}
