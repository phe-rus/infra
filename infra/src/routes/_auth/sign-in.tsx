import { useEffect } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { signInSchema, signInSearchSchema, useSignIn } from "@/domains/auth"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { t } from "@infra/ui/components/sonner"
import type { z } from "zod"

export const Route = createFileRoute("/_auth/sign-in")({
    validateSearch: signInSearchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const { reason } = Route.useSearch()
    const { mutateAsync: signIn } = useSignIn()

    useEffect(() => {
        if (reason === "session-expired") {
            t.error("Signed out", { description: "Sign in again to continue" })
        }
    }, [reason])

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
            await signIn(
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
