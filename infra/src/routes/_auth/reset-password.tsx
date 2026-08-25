import { createFileRoute, Link } from "@tanstack/react-router"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { useResetPassword } from "@/domains/auth"
import { cn } from "@infra/ui/lib/utils"

const resetPasswordSearchSchema = z.object({
    // better-auth's own /reset-password/:token callback redirects here with
    // ?token= appended (or ?error=INVALID_TOKEN if the link is bad/expired)
    token: z.string().optional(),
    error: z.string().optional(),
})

const newPasswordFormSchema = z.object({
    newPassword: z.string().min(8, "At least 8 characters").max(48, "At most 48 characters"),
})

export const Route = createFileRoute("/_auth/reset-password")({
    validateSearch: resetPasswordSearchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const { token, error } = Route.useSearch()
    const { mutateAsync: resetPassword } = useResetPassword()

    const form = useAppForm({
        defaultValues: { newPassword: "" },
        validators: { onChange: newPasswordFormSchema },
        onSubmit: async ({ value }) => {
            if (!token) return
            await resetPassword({
                data: {
                    newPassword: value.newPassword,
                    token: token,
                },
            })
        },
    })

    if (!token || error) {
        return (
            <div className={cn("flex w-full flex-col gap-5 md:max-w-md", "container m-auto py-10")}>
                <section>
                    <h1 className="text-3xl">Link expired</h1>
                    <p className="text-muted-foreground">
                        This password reset link is invalid or has expired — request a new one.
                    </p>
                </section>
                <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:underline"
                >
                    ← Request a new link
                </Link>
            </div>
        )
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className={cn("flex w-full flex-col gap-5 md:max-w-md", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Set a new password</h1>
                <p className="text-muted-foreground">Choose a new password for your account.</p>
            </section>

            <form.AppForm>
                <FieldGroup>
                    <form.AppField
                        name="newPassword"
                        children={(field) => (
                            <field.input
                                label="New password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="At least 8 characters"
                            />
                        )}
                    />
                </FieldGroup>

                <form.submit label="Reset password" />
            </form.AppForm>
        </form>
    )
}
