import { createFileRoute } from "@tanstack/react-router"
import { allowedRolesQueryOptions, customRolesQueryOptions } from "@/functions/rolesFn"
import { useUpdateTeamRoles } from "@/hooks/rolesHooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RoleEditor } from "@/components/dashboard/roles"
import { useAppForm } from "@/components/widgets/blocks"
import { z } from "zod"

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

const teamRolesSchema = z.object({
    customRoles: z.array(
        z.object({
            name: z.string().min(1),
            permissions: z.object({
                user: z.array(z.string()),
                session: z.array(z.string()),
            }),
            adminTier: z.boolean(),
        })
    ),
    allowedRoles: z.array(z.string()),
})

function RouteComponent() {
    const { user } = Route.useRouteContext()
    const { customRoles, allowedRoles } = Route.useLoaderData()
    const isOwner = user.role === "owner"
    const { mutateAsync: updateTeamRoles } = useUpdateTeamRoles()

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
                    <CardContent>
                        <form.AppField
                            name="customRoles"
                            children={(field) => (
                                <form.Subscribe selector={(state) => state.values.allowedRoles}>
                                    {(currentAllowedRoles) => (
                                        <RoleEditor
                                            roles={field.state.value}
                                            allowedRoles={currentAllowedRoles}
                                            onAdd={isOwner ? (role) => field.pushValue(role) : undefined}
                                            onRemove={isOwner ? (index) => field.removeValue(index) : undefined}
                                            onToggleAllowed={isOwner ? toggleAllowedRole : undefined}
                                        />
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
