import { FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PERMISSION_STATEMENTS, FIXED_ROLE_NAMES, permissionLabel } from "@/auth/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { IconPlus, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { withForm } from "@/components/widgets/blocks"
import { FIXED_ROLE_COPY, wizardDefaultValues } from "../schema"

export const RolesStep = withForm({
    defaultValues: wizardDefaultValues,
    render: ({ form }) => {
        const [draftName, setDraftName] = useState("")
        const [draftPermissions, setDraftPermissions] = useState<{ user: string[]; session: string[] }>({
            user: [],
            session: [],
        })
        const [draftAdminTier, setDraftAdminTier] = useState(false)

        function toggleDraftPermission(resource: "user" | "session", action: string) {
            setDraftPermissions((prev) => {
                const current = prev[resource]
                const next = current.includes(action)
                    ? current.filter((a) => a !== action)
                    : [...current, action]
                return { ...prev, [resource]: next }
            })
        }

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
                        <div className="flex flex-col gap-3">
                            {field.state.value.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {field.state.value.map((role, index) => (
                                        <Card key={`${role.name}-${index}`} size="sm">
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between gap-2">
                                                    <span className="flex items-center gap-2">
                                                        {role.name}
                                                        {role.adminTier && (
                                                            <Badge variant="secondary">Elevated</Badge>
                                                        )}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        aria-label={`Remove ${role.name}`}
                                                        onClick={() => field.removeValue(index)}
                                                    >
                                                        <IconX />
                                                    </Button>
                                                </CardTitle>
                                                <CardDescription>
                                                    {[...role.permissions.user, ...role.permissions.session]
                                                        .map(permissionLabel)
                                                        .join(", ") || "No permissions selected"}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <Card size="sm">
                                <CardHeader>
                                    <CardTitle>Add a role</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    <FieldLabel htmlFor="new-role-name">Role name</FieldLabel>
                                    <Input
                                        id="new-role-name"
                                        value={draftName}
                                        onChange={(e) => setDraftName(e.target.value)}
                                        placeholder="e.g. support"
                                    />

                                    {(["user", "session"] as const).map((resource) => (
                                        <div key={resource} className="flex flex-col gap-1.5">
                                            <FieldLabel className="capitalize">
                                                {resource} permissions
                                            </FieldLabel>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                                {PERMISSION_STATEMENTS[resource].map((action) => (
                                                    <div
                                                        key={action}
                                                        className="flex w-fit items-center gap-1.5"
                                                    >
                                                        <Checkbox
                                                            aria-label={permissionLabel(action)}
                                                            isSelected={draftPermissions[resource].includes(action)}
                                                            onChange={() => toggleDraftPermission(resource, action)}
                                                        />
                                                        <FieldLabel>{permissionLabel(action)}</FieldLabel>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex w-fit items-center gap-1.5">
                                        <Checkbox
                                            aria-label="Grant elevated (admin) access"
                                            isSelected={draftAdminTier}
                                            onChange={setDraftAdminTier}
                                        />
                                        <FieldLabel>Grant elevated (admin) access</FieldLabel>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        isDisabled={!draftName.trim()}
                                        onClick={() => {
                                            field.pushValue({
                                                name: draftName.trim(),
                                                permissions: draftPermissions,
                                                adminTier: draftAdminTier,
                                            })
                                            setDraftName("")
                                            setDraftPermissions({ user: [], session: [] })
                                            setDraftAdminTier(false)
                                        }}
                                    >
                                        <IconPlus /> Add role
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                />
            </FieldGroup>
        )
    },
})
