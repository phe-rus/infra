import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { FieldGroup } from "@infra/ui/components/field"
import { useAppForm } from "@infra/ui/widgets/blocks"
import { ViewController } from "@infra/ui/widgets/view-controller"
import {
    authClient,
    continueOrGoHome,
} from "@/lib/auth-client"
import { t } from "@infra/ui/components/sonner"
import { m } from "../../paraglide/messages"

export const Route = createFileRoute("/_auth/two-factor")({
    component: RouteComponent,
})

function RouteComponent() {
    const codeSchema = z.object({
        code: z
            .string()
            .min(1, m["auth.twoFactor.codeRequired"]()),
        trustDevice: z.boolean(),
    })

    const form = useAppForm({
        defaultValues: { code: "", trustDevice: false },
        validators: {
            onChange: codeSchema,
        },
        onSubmit: async ({ value }) => {
            const { data, error: verifyError } =
                await authClient.twoFactor.verifyTotp({
                    code: value.code,
                    trustDevice: value.trustDevice,
                })
            if (verifyError) {
                t.error(
                    verifyError.message ??
                        m["auth.twoFactor.invalidCode"]()
                )
                return
            }
            continueOrGoHome(data)
        },
    })

    return (
        <ViewController
            className="m-auto py-10 md:max-w-md"
            heading={
                <ViewController.Heading
                    size="compact"
                    title={m["auth.twoFactor.title"]()}
                    description={m[
                        "auth.twoFactor.description"
                    ]()}
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
                <form.AppForm>
                    <FieldGroup>
                        <form.AppField
                            name="code"
                            children={(field) => (
                                <field.otp
                                    label={m[
                                        "auth.twoFactor.codeLabel"
                                    ]()}
                                    onComplete={() =>
                                        void form.handleSubmit()
                                    }
                                />
                            )}
                        />
                        <form.AppField
                            name="trustDevice"
                            children={(field) => (
                                <field.checkbox
                                    label={m[
                                        "auth.twoFactor.trustDevice"
                                    ]()}
                                />
                            )}
                        />
                    </FieldGroup>

                    <form.submit
                        label={m["auth.twoFactor.submit"]()}
                    />
                </form.AppForm>
            </form>
        </ViewController>
    )
}
