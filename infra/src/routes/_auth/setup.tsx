import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { Button } from "@infra/ui/components/button"
import {
    completeSetupSchema,
    useCompleteSetup,
    useRunSetupMigrations,
} from "@/domains/auth"
import { ViewController } from "@/components/views"
import { IconLoader2 } from "@tabler/icons-react"
import type { z } from "zod"

export const Route = createFileRoute("/_auth/setup")({
    loader: async ({ context: { hasAdmin } }) => {
        if (hasAdmin) throw redirect({ to: "/sign-in", replace: true })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const [initialized, setInitialized] = useState(false)

    const { mutateAsync: runMigrations, isPending: migrating } =
        useRunSetupMigrations()
    const { mutateAsync: completeSetup } = useCompleteSetup()

    async function handleInitialize() {
        await runMigrations()
        setInitialized(true)
    }

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

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Infra"
                    description={
                        initialized
                            ? "Create the admin account"
                            : "Set up your instance"
                    }
                />
            }
        >
            {initialized ? (
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
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        This instance hasn't been initialized yet. This prepares
                        the database and only needs to run once.
                    </p>
                    <Button
                        type="button"
                        isDisabled={migrating}
                        onClick={() => void handleInitialize()}
                    >
                        {migrating && <IconLoader2 className="animate-spin" />}
                        {migrating ? "Initializing…" : "Initialize"}
                    </Button>
                </>
            )}
        </ViewController>
    )
}
