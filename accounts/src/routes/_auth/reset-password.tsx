import { createFileRoute, Link } from "@tanstack/react-router"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { useResetPassword } from "@/domains/auth"
import { m } from "../../paraglide/messages"

const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
})

export const Route = createFileRoute("/_auth/reset-password")(
    {
        validateSearch: resetPasswordSearchSchema,
        component: RouteComponent,
    }
)

function RouteComponent() {
    const newPasswordFormSchema = z.object({
        newPassword: z
            .string()
            .min(8, m["auth.common.password.tooShort"]())
            .max(48, m["auth.common.password.tooLong"]()),
    })

    const { token, error } = Route.useSearch()
    const { mutateAsync: resetPassword } = useResetPassword()
    const invalid = !token || error

    const form = useAppForm({
        defaultValues: { newPassword: "" },
        validators: { onChange: newPasswordFormSchema },
        onSubmit: async ({ value }) => {
            if (!token) return
            await resetPassword({
                newPassword: value.newPassword,
                token: token,
            })
        },
    })

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title={
                        invalid
                            ? m[
                                  "auth.resetPassword.expiredTitle"
                              ]()
                            : m["auth.resetPassword.title"]()
                    }
                    description={
                        invalid
                            ? m[
                                  "auth.resetPassword.expiredDescription"
                              ]()
                            : m[
                                  "auth.resetPassword.description"
                              ]()
                    }
                />
            }
        >
            {invalid ? (
                <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:underline"
                >
                    {m["auth.resetPassword.requestNewLink"]()}
                </Link>
            ) : (
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
                                name="newPassword"
                                children={(field) => (
                                    <field.input
                                        label={m[
                                            "auth.resetPassword.newPasswordLabel"
                                        ]()}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder={m[
                                            "auth.common.password.tooShort"
                                        ]()}
                                    />
                                )}
                            />
                        </FieldGroup>

                        <form.submit
                            label={m[
                                "auth.resetPassword.submit"
                            ]()}
                        />
                    </form.AppForm>
                </form>
            )}
        </ViewController>
    )
}
