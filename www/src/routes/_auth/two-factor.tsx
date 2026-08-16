import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/ui/field"
import { useAppForm } from "@infra/ui/components/widgets/blocks"
import { cn } from "@infra/ui/lib/utils"
import { authClient } from "@/lib/auth-client"

const codeSchema = z.object({
    code: z.string().min(1, "Enter the code"),
})

export const Route = createFileRoute("/_auth/two-factor")({
    component: RouteComponent,
})

function RouteComponent() {
    const [error, setError] = useState<string | null>(null)

    const form = useAppForm({
        defaultValues: { code: "" } as z.input<typeof codeSchema>,
        validators: {
            onChange: codeSchema,
        },
        onSubmit: async ({ value }) => {
            setError(null)
            // the pending challenge lives in a server-side cookie set during
            // the original sign-in call — nothing from that request needs
            // to be carried over here besides the code itself
            const { data, error: verifyError } = await authClient.twoFactor.verifyTotp({
                code: value.code,
            })
            if (verifyError) {
                setError(verifyError.message ?? "Invalid code")
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
            className={cn("flex w-full md:max-w-md flex-col gap-5", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Two-factor verification</h1>
                <p className="text-muted-foreground">Enter the code from your authenticator app</p>
            </section>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <form.AppForm>
                <FieldGroup>
                    <form.AppField
                        name="code"
                        children={(field) => (
                            <field.input
                                label="Code"
                                autoComplete="one-time-code"
                                placeholder="123456"
                            />
                        )}
                    />
                </FieldGroup>

                <form.submit label="Verify" />
            </form.AppForm>
        </form>
    )
}
