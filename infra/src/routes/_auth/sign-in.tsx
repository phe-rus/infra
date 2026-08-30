import { signInSchema, useResendVerificationEmail, useSignIn } from "@/domains/auth"
import { FieldGroup } from "@infra/ui/components/field"
import { t } from "@infra/ui/components/sonner"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import type { z } from "zod"

export const Route = createFileRoute("/_auth/sign-in")({
    loader: async ({ context: { hasAdmin, session } }) => {
        if (!hasAdmin) {
            throw redirect({
                to: "/setup",
                replace: true
            })
        }
        if (session) {
            throw redirect({
                to: "/",
                replace: true
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { mutateAsync: signIn } = useSignIn()
    const { mutateAsync: resendVerificationEmail } = useResendVerificationEmail()
    const defaultValues: z.input<typeof signInSchema> = {
        email: "",
        password: "",
        rememberMe: true,
    }

    const form = useAppForm({
        defaultValues: defaultValues,
        validators: {
            onChange: signInSchema,
            onSubmit: signInSchema,
            onBlur: signInSchema,
        },
        onSubmit: async ({ value }) => {
            const search = window.location.search
            const oauthQuery = search.length > 1 ? search.slice(1) : undefined
            const result = await signIn(
                {
                    data: {
                        email: value.email,
                        password: value.password,
                        rememberMe: value.rememberMe,
                        oauthQuery,
                    },
                },
                {
                    onSettled: () => {
                        form.reset()
                    },
                }
            )
            if (result.code === "EMAIL_NOT_VERIFIED") {
                t.error("Email not verified", {
                    description: "Resend the link and try again.",
                    actionProps: {
                        children: "Resend",
                        onClick: () =>
                            void resendVerificationEmail({
                                data: { email: value.email },
                            }),
                    },
                })
            }
        },
    })

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Infra"
                    description="Sign in to your account"
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
            </form>
        </ViewController>
    )
}
