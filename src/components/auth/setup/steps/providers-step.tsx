import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { withForm } from "@/components/widgets/blocks"
import { METHOD_LABELS, TOGGLEABLE_METHODS } from "@/auth/settings/methods"
import { wizardDefaultValues } from "../schema"

export const ProvidersStep = withForm({
    defaultValues: wizardDefaultValues,
    render: ({ form }) => (
        <FieldGroup>
            <FieldDescription>
                {METHOD_LABELS.emailAndPassword} is always on. Enable anything else you want available
                now. All of this stays changeable later.
            </FieldDescription>

            <form.AppField
                name="requireEmailVerification"
                children={(field) => <field.checkbox label="Require email verification" />}
            />

            {TOGGLEABLE_METHODS.map((method) => (
                <form.AppField
                    key={method}
                    name={`authMethods.${method}`}
                    children={(field) => <field.checkbox label={METHOD_LABELS[method]} />}
                />
            ))}
        </FieldGroup>
    ),
})
