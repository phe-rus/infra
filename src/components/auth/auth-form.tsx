import { FieldGroup } from "@/components/ui/field"
import { useAppForm } from "@/components/blocks"
import { signInEmail } from "@/functions/authFn"
import { useNavigate } from "@tanstack/react-router"
import { t } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { z } from "zod"

const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
})

export function AuthForm() {
    const navigate = useNavigate()

    const form = useAppForm({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: true,
        } as z.input<typeof signInSchema>,
        validators: {
            onChange: signInSchema,
        },
        onSubmit: async ({ value }) => {
            const { error } = await signInEmail({
                data: {
                    email: value.email,
                    password: value.password,
                    rememberMe: value.rememberMe,
                },
            })
            if (error) {
                t.error("Sign in failed", {
                    description: error
                })
                return
            }
            navigate({ to: "/", replace: true, reloadDocument: true })
        }
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
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">Sign in to your account</p>
            </section>

            <form.AppForm>
                <FieldGroup>
                    <form.AppField
                        name="email"
                        children={(field) => (
                            <field.input label="Email" type="email" autoComplete="email" placeholder="Enter your email" />
                        )}
                    />

                    <form.AppField
                        name="password"
                        children={(field) => (
                            <field.input
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                        )}
                    />

                    <form.AppField
                        name="rememberMe"
                        children={(field) => <field.checkbox label="Remember me" />}
                    />
                </FieldGroup>

                <form.submit label="Sign in" />
            </form.AppForm>
        </form>
    )
}
