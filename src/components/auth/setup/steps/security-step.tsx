import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { withForm } from "@/components/widgets/blocks"
import { wizardDefaultValues } from "../schema"

export const SecurityStep = withForm({
    defaultValues: wizardDefaultValues,
    render: ({ form }) => (
        <FieldGroup>
            <FieldDescription>
                Controls how session cookies are issued. Leave these off for a single-domain local
                setup.
            </FieldDescription>

            <form.AppField
                name="useSecureCookies"
                children={(field) => <field.checkbox label="Use secure cookies (HTTPS only)" />}
            />

            <form.AppField
                name="crossSubDomainCookies"
                children={(field) => <field.checkbox label="Share cookies across subdomains" />}
            />

            <form.Subscribe selector={(state) => state.values.crossSubDomainCookies}>
                {(enabled) =>
                    enabled && (
                        <form.AppField
                            name="cookieDomain"
                            children={(field) => (
                                <field.input label="Cookie domain" placeholder=".example.com" />
                            )}
                        />
                    )
                }
            </form.Subscribe>
        </FieldGroup>
    ),
})
