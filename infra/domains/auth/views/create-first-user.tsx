import type { FC } from "react"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { completeSetupSchema, useCompleteSetup } from "@/domains/auth"
import { ViewController } from "@/components/views"
import type { z } from "zod"

export const CreateFirstUser: FC = () => {
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
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Infra"
                    description="Create the admin account"
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
