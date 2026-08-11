import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { withForm } from "@/components/widgets/blocks"
import { wizardDefaultValues } from "../schema"

export const BasicStep = withForm({
    defaultValues: wizardDefaultValues,
    render: ({ form }) => (
        <FieldGroup>
            <FieldDescription>Name your instance. You can change this later.</FieldDescription>
            <form.AppField
                name="appName"
                children={(field) => <field.input label="App name" placeholder="Infra" />}
            />
        </FieldGroup>
    ),
})
