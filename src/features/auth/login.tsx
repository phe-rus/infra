import { Link } from "@tanstack/react-router"
import { FieldGroup } from "@/components/ui/field"
import { useAppForm } from "@/components/widgets/blocks"
import { signInSchema, useSignIn } from "@/kit/auth"
import { cn } from "@/lib/utils"
import type { z } from "zod"

export function Login() {
    const { mutateAsync: signIn } = useSignIn()

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
            className={cn("flex w-full md:max-w-md flex-col gap-5", "container m-auto py-10")}
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

                    <div className="flex items-center justify-between">
                        <form.AppField
                            name="rememberMe"
                            children={(field) => <field.checkbox label="Remember me" />}
                        />
                        <Link to="/forgot-password" className="text-muted-foreground text-xs hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </FieldGroup>

                <form.submit label="Sign in" />
            </form.AppForm>
        </form>
    )
}
