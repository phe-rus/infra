import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { withForm } from "@/components/blocks"
import { wizardDefaultValues } from "../schema"

export const OwnerStep = withForm({
    defaultValues: wizardDefaultValues,
    render: ({ form }) => (
        <FieldGroup>
            <FieldDescription>
                This account is the instance owner. It has full access to everything.
            </FieldDescription>

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
    ),
})
