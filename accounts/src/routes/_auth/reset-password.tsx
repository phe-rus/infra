import { createFileRoute, Link } from "@tanstack/react-router"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { useResetPassword } from "@/domains/auth"

const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
})

const newPasswordFormSchema = z.object({
    newPassword: z
        .string()
        .min(8, "At least 8 characters")
        .max(48, "At most 48 characters"),
})

export const Route = createFileRoute("/_auth/reset-password")({
    validateSearch: resetPasswordSearchSchema,
    component: RouteComponent,
})

function RouteComponent() {
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
                        invalid ? "Link expired" : "Set a new password"
                    }
                    description={
                        invalid
                            ? "This password reset link is invalid or has expired, request a new one."
                            : "Choose a new password for your account."
                    }
                />
            }
        >
            {invalid ? (
                <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:underline"
                >
                    ← Request a new link
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
            )}
        </ViewController>
    )
}
