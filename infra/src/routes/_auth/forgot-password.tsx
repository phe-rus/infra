import { createFileRoute, Link } from "@tanstack/react-router"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { forgotPasswordSchema, useRequestPasswordReset } from "@/kit/auth"
import { cn } from "@infra/ui/lib/utils"
import type { z } from "zod"
import { buttonVariants } from "@infra/ui/components/button"
import { IconArrowLeft } from "@tabler/icons-react"

export const Route = createFileRoute("/_auth/forgot-password")({
    component: RouteComponent,
})

function RouteComponent() {
    const { mutateAsync: requestPasswordReset, isSuccess } = useRequestPasswordReset()

    const form = useAppForm({
        // eslint's type info disagrees this is needed, but tsc requires it
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        defaultValues: { email: "" } as z.input<typeof forgotPasswordSchema>,
        validators: { onChange: forgotPasswordSchema },
        onSubmit: async ({ value }) => {
            await requestPasswordReset({ data: { email: value.email } })
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className={cn("flex w-full flex-col gap-5 md:max-w-md", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Reset your password</h1>
                <p className="text-muted-foreground">
                    {isSuccess
                        ? "If that email exists, a reset link is on its way."
                        : "Enter your email and we'll send you a link to reset it."}
                </p>
            </section>

            {!isSuccess && (
                <form.AppForm>
                    <FieldGroup>
                        <form.AppField
                            name="email"
                            children={(field) => (
                                <field.input
                                    label="Email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                />
                            )}
                        />
                    </FieldGroup>

                    <form.submit label="Send reset link" />
                </form.AppForm>
            )}

            <Link
                to="/sign-in"
                className={cn(
                    buttonVariants({
                        variant: "link",
                        size: "sm",
                        className: "mr-auto px-0",
                    })
                )}
            >
                <IconArrowLeft />
                Back to sign in
            </Link>
        </form>
    )
}
