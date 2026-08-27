import { createFileRoute, Link } from "@tanstack/react-router"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { forgotPasswordSchema, useRequestPasswordReset } from "@/domains/auth"
import { cn } from "@infra/ui/lib/utils"
import type { z } from "zod"
import { buttonVariants } from "@infra/ui/components/button"
import { IconArrowLeft } from "@tabler/icons-react"
import { ViewController } from "@infra/ui/widgets/view-controller"

export const Route = createFileRoute("/_auth/forgot-password")({
    component: RouteComponent,
})

function RouteComponent() {
    const { mutateAsync: requestPasswordReset, isSuccess } =
        useRequestPasswordReset()

    const form = useAppForm({
        defaultValues: { email: "" } as z.input<typeof forgotPasswordSchema>,
        validators: { onChange: forgotPasswordSchema },
        onSubmit: async ({ value }) => {
            await requestPasswordReset({ data: { email: value.email } })
        },
    })

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title="Reset your password"
                    description={
                        isSuccess
                            ? "If that email exists, a reset link is on its way."
                            : "Enter your email and we'll send you a link to reset it."
                    }
                />
            }
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    void form.handleSubmit()
                }}
                className="flex flex-col gap-5"
            >
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
        </ViewController>
    )
}
