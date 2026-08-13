import { createFileRoute } from "@tanstack/react-router"
import { FieldGroup } from "@/components/ui/field"
import { useAppForm } from "@/components/widgets/blocks"
import { createAccountSchema, useCreateAccount } from "@/kit/auth"
import { cn } from "@/lib/utils"
import type { z } from "zod"

export const Route = createFileRoute("/_auth/create-account")({
    component: RouteComponent,
})

function RouteComponent() {
    const { mutateAsync: createAccount } = useCreateAccount()

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
            // same as sign-in: forward the whole signed authorize query
            // verbatim, not a single wrapped oauth_query param
            const search = window.location.search
            const oauthQuery = search.length > 1 ? search.slice(1) : undefined
            await createAccount(
                { data: { name: value.name, email: value.email, password: value.password, oauthQuery } },
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
                <p className="text-muted-foreground">Create an account</p>
            </section>

            <form.AppForm>
                <FieldGroup>
                    <form.AppField
                        name="name"
                        children={(field) => <field.input label="Name" autoComplete="name" placeholder="Your name" />}
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
        </form>
    )
}
