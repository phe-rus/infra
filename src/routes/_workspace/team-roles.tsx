import { createFileRoute } from "@tanstack/react-router"
import { allowedRolesQueryOptions, customRolesQueryOptions } from "@/hooks/rolesHooks"
import { useUpdateTeamRoles } from "@/hooks/rolesHooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppForm } from "@/components/widgets/blocks"
import { teamRolesSchema } from "@/schemas/team-roles"
import { PERMISSION_STATEMENTS, isOwner as isOwnerRole, permissionLabel } from "@/auth/permissions"
import { IconPlus, IconX } from "@tabler/icons-react"
import { useState } from "react"

export const Route = createFileRoute("/_workspace/team-roles")({
    loader: async ({ context: { q } }) => {
        const [customRoles, allowedRoles] = await Promise.all([
            q.ensureQueryData(customRolesQueryOptions()),
            q.ensureQueryData(allowedRolesQueryOptions()),
        ])
        return { customRoles, allowedRoles }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = Route.useRouteContext()
    const { customRoles, allowedRoles } = Route.useLoaderData()
    const isOwner = isOwnerRole(user.role ?? "")
    const { mutateAsync: updateTeamRoles } = useUpdateTeamRoles()

    const [draftName, setDraftName] = useState("")
    const [draftPermissions, setDraftPermissions] = useState<{ user: string[]; session: string[] }>({
        user: [],
        session: [],
    })
    const [draftAdminTier, setDraftAdminTier] = useState(false)

    const form = useAppForm({
        defaultValues: { customRoles, allowedRoles },
        validators: {
            onChange: teamRolesSchema,
        },
        onSubmit: async ({ value }) => {
            await updateTeamRoles(value)
        },
    })

    function toggleAllowedRole(name: string) {
        form.setFieldValue("allowedRoles", (prev) =>
            prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]
        )
    }

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
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className="container mx-auto flex w-full flex-col gap-5 py-20 md:max-w-2xl"
        >
            <section>
                <h1 className="text-3xl md:text-4xl">Teams & roles</h1>
                <p className="text-muted-foreground">
                    Control which roles can sign in to this instance, and what each role can do.
                    {!isOwner && " Only an owner can make changes here."}
                </p>
            </section>

            <form.AppForm>
                <Card>
                    <CardHeader>
                        <CardTitle>Fixed roles</CardTitle>
                        <CardDescription>
                            Owner and admin always have access. The user role needs to be granted access
                            explicitly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Card size="sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    Owner <Badge variant="secondary">Always allowed</Badge>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card size="sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    Admin <Badge variant="secondary">Always allowed</Badge>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <form.Subscribe selector={(state) => state.values.allowedRoles}>
                            {(currentAllowedRoles) => (
                                <Card size="sm">
                                    <CardHeader>
                                        <CardTitle>User</CardTitle>
                                        <CardDescription>
                                            The default role for anyone who signs up. No elevated
                                            permissions.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Field orientation="horizontal" className="w-fit">
                                            <Checkbox
                                                aria-label="Allow the user role to access this instance"
                                                isSelected={currentAllowedRoles.includes("user")}
                                                onChange={() => toggleAllowedRole("user")}
                                                isDisabled={!isOwner}
                                            />
                                            <FieldLabel>Allowed to access this instance</FieldLabel>
                                        </Field>
                                    </CardContent>
                                </Card>
                            )}
                        </form.Subscribe>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Custom roles</CardTitle>
                        <CardDescription>
                            Define finer-grained access and choose which of these roles can access this
                            instance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <form.Field
                            name="customRoles"
                            children={(field) => (
                                <form.Subscribe selector={(state) => state.values.allowedRoles}>
                                    {(currentAllowedRoles) => (
                                        <>
                                            {field.state.value.length > 0 && (
                                                <div className="flex flex-col gap-2">
                                                    {field.state.value.map((role, index) => (
                                                        <Card key={`${role.name}-${index}`} size="sm">
                                                            <CardHeader>
                                                                <CardTitle className="flex items-center justify-between gap-2">
                                                                    <span className="flex items-center gap-2">
                                                                        {role.name}
                                                                        {role.adminTier && (
                                                                            <Badge variant="secondary">
                                                                                Elevated
                                                                            </Badge>
                                                                        )}
                                                                    </span>
                                                                    {isOwner && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon-xs"
                                                                            aria-label={`Remove ${role.name}`}
                                                                            onClick={() => field.removeValue(index)}
                                                                        >
                                                                            <IconX />
                                                                        </Button>
                                                                    )}
                                                                </CardTitle>
                                                                <CardDescription>
                                                                    {[
                                                                        ...role.permissions.user,
                                                                        ...role.permissions.session,
                                                                    ]
                                                                        .map(permissionLabel)
                                                                        .join(", ") || "No permissions selected"}
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <Field orientation="horizontal" className="w-fit">
                                                                    <Checkbox
                                                                        aria-label={`Allow ${role.name} to access this instance`}
                                                                        isSelected={currentAllowedRoles.includes(
                                                                            role.name
                                                                        )}
                                                                        onChange={() => toggleAllowedRole(role.name)}
                                                                        isDisabled={!isOwner}
                                                                    />
                                                                    <FieldLabel>
                                                                        Allowed to access this instance
                                                                    </FieldLabel>
                                                                </Field>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}

                                            {isOwner && (
                                                <Card size="sm">
                                                    <CardHeader>
                                                        <CardTitle>Add a role</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="flex flex-col gap-3">
                                                        <Field>
                                                            <FieldLabel htmlFor="new-role-name">
                                                                Role name
                                                            </FieldLabel>
                                                            <Input
                                                                id="new-role-name"
                                                                value={draftName}
                                                                onChange={(e) => setDraftName(e.target.value)}
                                                                placeholder="e.g. support"
                                                            />
                                                        </Field>

                                                        {(["user", "session"] as const).map((resource) => (
                                                            <div
                                                                key={resource}
                                                                className="flex flex-col gap-1.5"
                                                            >
                                                                <FieldLabel className="capitalize">
                                                                    {resource} permissions
                                                                </FieldLabel>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                                                    {PERMISSION_STATEMENTS[resource].map(
                                                                        (action) => (
                                                                            <Field
                                                                                key={action}
                                                                                orientation="horizontal"
                                                                                className="w-fit"
                                                                            >
                                                                                <Checkbox
                                                                                    aria-label={permissionLabel(
                                                                                        action
                                                                                    )}
                                                                                    isSelected={draftPermissions[
                                                                                        resource
                                                                                    ].includes(action)}
                                                                                    onChange={() =>
                                                                                        toggleDraftPermission(
                                                                                            resource,
                                                                                            action
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <FieldLabel>
                                                                                    {permissionLabel(action)}
                                                                                </FieldLabel>
                                                                            </Field>
                                                                        )
                                                                    )}
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
                                            )}
                                        </>
                                    )}
                                </form.Subscribe>
                            )}
                        />
                    </CardContent>
                </Card>

                {isOwner && (
                    <div>
                        <form.submit label="Save changes" />
                    </div>
                )}
            </form.AppForm>
        </form>
    )
}
