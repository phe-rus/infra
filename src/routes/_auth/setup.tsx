import { createFileRoute, redirect } from "@tanstack/react-router"
import { FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/components/widgets/blocks"
import { useCompleteSetup, useRunSetupMigrations } from "@/hooks/setupHooks"
import { cn } from "@/lib/utils"
import { completeSetupSchema } from "@/schemas/setup"
import { IconLoader2 } from "@tabler/icons-react"
import { useState } from "react"
import type { z } from "zod"

export const Route = createFileRoute("/_auth/setup")({
    loader: async ({ context: { hasOwner } }) => {
        if (hasOwner) throw redirect({ to: "/sign-in", replace: true })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const [initialized, setInitialized] = useState(false)
    const { mutateAsync: runMigrations, isPending: migrating } = useRunSetupMigrations()
    const { mutateAsync: completeSetup } = useCompleteSetup()

    const form = useAppForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            rememberMe: true,
        } as z.input<typeof completeSetupSchema>,
        validators: {
            onChange: completeSetupSchema,
        },
        onSubmit: async ({ value }) => {
            await completeSetup({ data: value })
        },
    })

    async function handleInitialize() {
        await runMigrations()
        setInitialized(true)
    }

    if (!initialized) {
        return (
            <div className={cn("flex w-full md:max-w-md flex-col gap-5", "container m-auto py-10")}>
                <section>
                    <h1 className="text-3xl">Infra</h1>
                    <p className="text-muted-foreground">Set up your instance</p>
                </section>
                <p className="text-sm text-muted-foreground">
                    This instance hasn't been initialized yet. This prepares the database and only
                    needs to run once.
                </p>
                <Button type="button" isDisabled={migrating} onClick={() => void handleInitialize()}>
                    {migrating && <IconLoader2 className="animate-spin" />}
                    {migrating ? "Initializing…" : "Initialize"}
                </Button>
            </div>
        )
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
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">Create the owner account</p>
            </section>

            <form.AppForm>
                <FieldGroup>
                    <form.AppField
                        name="name"
                        children={(field) => (
                            <field.input label="Name" autoComplete="name" placeholder="Enter your name" />
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
                        children={(field) => <field.checkbox label="Remember me" />}
                    />
                </FieldGroup>

                <form.submit label="Create owner account" />
            </form.AppForm>
        </form>
    )
}
