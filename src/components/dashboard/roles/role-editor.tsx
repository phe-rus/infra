import type { CustomRole } from "@/auth/settings/roles-store"
import { Field, FieldLabel } from "@/components/ui/field"
import { PERMISSION_STATEMENTS, permissionLabel } from "@/auth/permissions"
import { IconPlus, IconX } from "@tabler/icons-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

type RoleEditorProps = {
    roles: CustomRole[]
    onAdd?: (role: CustomRole) => void
    onRemove?: (index: number) => void
    allowedRoles?: string[]
    onToggleAllowed?: (name: string) => void
}

export function RoleEditor({ roles, onAdd, onRemove, allowedRoles, onToggleAllowed }: RoleEditorProps) {
    const [draftName, setDraftName] = useState("")
    const [draftPermissions, setDraftPermissions] = useState<{ user: string[]; session: string[] }>({
        user: [],
        session: [],
    })
    const [draftAdminTier, setDraftAdminTier] = useState(false)
    const canEdit = Boolean(onAdd && onRemove)
    const showAllowedToggle = Boolean(allowedRoles && onToggleAllowed)

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
        <div className="flex flex-col gap-3">
            {roles.length > 0 && (
                <div className="flex flex-col gap-2">
                    {roles.map((role, index) => (
                        <Card key={`${role.name}-${index}`} size="sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-2">
                                        {role.name}
                                        {role.adminTier && <Badge variant="secondary">Elevated</Badge>}
                                    </span>
                                    {canEdit && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Remove ${role.name}`}
                                            onClick={() => onRemove?.(index)}
                                        >
                                            <IconX />
                                        </Button>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {[...role.permissions.user, ...role.permissions.session]
                                        .map(permissionLabel)
                                        .join(", ") || "No permissions selected"}
                                </CardDescription>
                            </CardHeader>
                            {showAllowedToggle && (
                                <CardContent>
                                    <Field orientation="horizontal" className="w-fit">
                                        <Checkbox
                                            aria-label={`Allow ${role.name} to access this instance`}
                                            isSelected={allowedRoles?.includes(role.name)}
                                            onChange={() => onToggleAllowed?.(role.name)}
                                        />
                                        <FieldLabel>Allowed to access this instance</FieldLabel>
                                    </Field>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {canEdit && (
                <Card size="sm">
                    <CardHeader>
                        <CardTitle>Add a role</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Field>
                            <FieldLabel htmlFor="new-role-name">Role name</FieldLabel>
                            <Input
                                id="new-role-name"
                                value={draftName}
                                onChange={(e) => setDraftName(e.target.value)}
                                placeholder="e.g. support"
                            />
                        </Field>

                        {(["user", "session"] as const).map((resource) => (
                            <div key={resource} className="flex flex-col gap-1.5">
                                <FieldLabel className="capitalize">{resource} permissions</FieldLabel>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                    {PERMISSION_STATEMENTS[resource].map((action) => (
                                        <Field key={action} orientation="horizontal" className="w-fit">
                                            <Checkbox
                                                aria-label={permissionLabel(action)}
                                                isSelected={draftPermissions[resource].includes(action)}
                                                onChange={() => toggleDraftPermission(resource, action)}
                                            />
                                            <FieldLabel>{permissionLabel(action)}</FieldLabel>
                                        </Field>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <Field orientation="horizontal">
                            <Checkbox
                                aria-label="Grant elevated (admin) access"
                                isSelected={draftAdminTier}
                                onChange={setDraftAdminTier}
                            />
                            <FieldLabel>Grant elevated (admin) access</FieldLabel>
                        </Field>

                        <Button
                            type="button"
                            variant="outline"
                            isDisabled={!draftName.trim()}
                            onClick={() => {
                                onAdd?.({
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
            )}
        </div>
    )
}
