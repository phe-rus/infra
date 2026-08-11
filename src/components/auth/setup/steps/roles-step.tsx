import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { FIXED_ROLE_NAMES } from "@/auth/permissions"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleEditor } from "@/components/dashboard/roles"
import { withForm } from "@/components/widgets/blocks"
import { FIXED_ROLE_COPY, wizardDefaultValues } from "../schema"

export const RolesStep = withForm({
    defaultValues: wizardDefaultValues,
    render: ({ form }) => {
        return (
            <FieldGroup>
                <FieldDescription>
                    Roles control what a user can do. Owner, admin, and user always exist. Add more if
                    you need finer-grained access.
                </FieldDescription>

                <div className="flex flex-col gap-2">
                    {FIXED_ROLE_NAMES.map((name) => (
                        <Card key={name} size="sm">
                            <CardHeader>
                                <CardTitle className="capitalize">{name}</CardTitle>
                                <CardDescription>{FIXED_ROLE_COPY[name]}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <form.Field
                    name="customRoles"
                    children={(field) => (
                        <RoleEditor
                            roles={field.state.value}
                            onAdd={(role) => field.pushValue(role)}
                            onRemove={(index) => field.removeValue(index)}
                        />
                    )}
                />
            </FieldGroup>
        )
    },
})
