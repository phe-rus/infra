import { setupSchema, useCompleteSetup, useResendVerificationEmail } from "@/domains/auth"
import { Button } from "@infra/ui/components/button"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState } from "react"
import type { z } from "zod"

export const Route = createFileRoute("/_auth/setup")({
    loader: async ({ context: { hasAdmin } }) => {
        if (hasAdmin) {
            throw redirect({
                to: "/sign-in",
                replace: true
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { mutateAsync: completeSetup } = useCompleteSetup()
    const { mutateAsync: resendVerificationEmail, isPending: isResending } =
        useResendVerificationEmail()
    const [needsVerification, setNeedsVerification] = useState(false)
    const [pendingEmail, setPendingEmail] = useState("")

    const form = useAppForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            rememberMe: true,
        } as z.input<typeof setupSchema>,
        validators: {
            onChange: setupSchema,
        },
        onSubmit: async ({ value }) => {
            const result = await completeSetup({ data: value })
            if (!result.error && result.needsVerification) {
                setPendingEmail(value.email)
                setNeedsVerification(true)
            }
        },
    })

    if (needsVerification) {
        return (
            <ViewController
                className="m-auto py-10 md:max-w-md"
                heading={
                    <ViewController.Heading
                        size="compact"
                        title="Check your email"
                        description="We sent a verification link to your email address. Follow it, then sign in."
                    />
                }
            >
                <Button
                    type="button"
                    variant="outline"
                    disabled={isResending}
                    onClick={() =>
                        void resendVerificationEmail({ data: { email: pendingEmail } })
                    }
                >
                    {isResending ? "Sending…" : "Resend verification email"}
                </Button>
            </ViewController>
        )
    }

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Infra"
                    description="Create the first admin account"
                />
            }
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                className="flex flex-col gap-5"
            >
                <form.AppForm>
                    <FieldGroup>
                        <form.AppField
                            name="name"
                            children={(field) => (
                                <field.input
                                    label="Name"
                                    autoComplete="name"
                                    placeholder="Enter your name"
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
                                    placeholder="Enter your password"
                                />
                            )}
                        />

                        <form.AppField
                            name="rememberMe"
                            children={(field) => (
                                <field.checkbox label="Remember me" />
                            )}
                        />
                    </FieldGroup>

                    <form.submit label="Create admin account" />
                </form.AppForm>
            </form>
        </ViewController>
    )
}
