import { createFileRoute, Link } from "@tanstack/react-router"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { buttonVariants } from "@infra/ui/components/button"
import { ViewController } from "@infra/ui/widgets/view-controller"
import { cn } from "@infra/ui/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { useRequestPasswordReset } from "@/domains/auth"
import { m } from "../../paraglide/messages"

export const Route = createFileRoute(
    "/_auth/forgot-password"
)({
    component: RouteComponent,
})

function RouteComponent() {
    const forgotPasswordSchema = z.object({
        email: z.email(m["auth.common.email.invalid"]()),
    })

    const { mutateAsync: requestPasswordReset, isSuccess } =
        useRequestPasswordReset()

    const form = useAppForm({
        defaultValues: { email: "" },
        validators: { onChange: forgotPasswordSchema },
        onSubmit: async ({ value }) => {
            await requestPasswordReset(value.email)
        },
    })

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title={m["auth.forgotPassword.title"]()}
                    description={
                        isSuccess
                            ? m[
                                  "auth.forgotPassword.successDescription"
                              ]()
                            : m[
                                  "auth.forgotPassword.pendingDescription"
                              ]()
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
                                        label={m[
                                            "auth.common.email.label"
                                        ]()}
                                        type="email"
                                        autoComplete="email"
                                        placeholder={m[
                                            "auth.common.email.placeholder"
                                        ]()}
                                    />
                                )}
                            />
                        </FieldGroup>

                        <form.submit
                            label={m[
                                "auth.forgotPassword.submit"
                            ]()}
                        />
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
                    <HugeiconsIcon icon={ArrowLeft01Icon} />
                    {m["auth.forgotPassword.backToSignIn"]()}
                </Link>
            </form>
        </ViewController>
    )
}
