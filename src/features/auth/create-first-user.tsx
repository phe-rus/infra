import { FieldGroup } from "@/components/ui/field"
import { useAppForm } from "@/components/widgets/blocks"
import { completeSetupSchema, useCompleteSetup } from "@/kit/auth"
import { cn } from "@/lib/utils"
import type { z } from "zod"

export function CreateFirstUser() {
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
                        children={(field) => <field.checkbox label="Remember me" />}
                    />
                </FieldGroup>

                <form.submit label="Create owner account" />
            </form.AppForm>
        </form>
    )
}
