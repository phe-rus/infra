import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { cn } from "@infra/ui/lib/utils"
import { authClient } from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"

export const Route = createFileRoute("/_auth/two-factor")({
    component: RouteComponent,
})

const codeSchema = z.object({
    code: z.string().min(1, "Enter the code"),
    trustDevice: z.boolean(),
})

function RouteComponent() {
    const form = useAppForm({
        defaultValues: { code: "", trustDevice: false } as z.input<typeof codeSchema>,
        validators: {
            onChange: codeSchema,
        },
        onSubmit: async ({ value }) => {
            const { data, error: verifyError } = await authClient.twoFactor.verifyTotp({
                code: value.code,
                trustDevice: value.trustDevice,
            })
            if (verifyError) {
                t.error(verifyError.message ?? "Invalid code")
                return
            }
            const redirectUri = (data as { redirect_uri?: string } | undefined)?.redirect_uri
            window.location.href = redirectUri ?? "/"
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
                <h1 className="text-3xl">Two-factor verification</h1>
                <p className="text-muted-foreground">Enter the code from your authenticator app</p>
            </section>

            <form.AppForm>
                <FieldGroup>
                    <form.AppField
                        name="code"
                        children={(field) => (
                            <field.otp label="Code" onComplete={() => void form.handleSubmit()} />
                        )}
                    />
                    <form.AppField
                        name="trustDevice"
                        children={(field) => (
                            <field.checkbox label="Trust this device for 30 days" />
                        )}
                    />
                </FieldGroup>

                <form.submit label="Verify" />
            </form.AppForm>
        </form>
    )
}
