import type { FC } from "react"
import { Link } from "@tanstack/react-router"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { signInSchema, useSignIn } from "@/kit/auth"
import { cn } from "@infra/ui/lib/utils"
import type { z } from "zod"

export const Login: FC = () => {
    const { mutateAsync: signIn } = useSignIn()

    const form = useAppForm({
        // widens rememberMe to match the schema's optional-boolean input type
        defaultValues: {
            email: "",
            password: "",
            rememberMe: true,
        } as z.input<typeof signInSchema>,
        validators: {
            onChange: signInSchema,
        },
        onSubmit: async ({ value }) => {
            // the oauth-provider plugin redirects here with the entire
            // signed authorize query as flat params (client_id, sig, ...),
            // not a single wrapped oauth_query param — forward it verbatim
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
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className={cn("flex w-full flex-col gap-5 md:max-w-md", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">Sign in to your account</p>
            </section>

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
                            children={(field) => <field.checkbox label="Remember me" />}
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
    )
}
