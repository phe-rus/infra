import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { IconLoader2 } from "@tabler/icons-react"
import { z } from "zod"
import { signInEmail, setupOwner } from "@/functions/authFn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { t } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

type AuthFormProps = {
    mode: "sign-in" | "setup"
}

const signInSchema = z.object({
    name: z.string(),
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
})

const setupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
})

export function AuthForm({ mode }: AuthFormProps) {
    const navigate = useNavigate()

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        validators: {
            onChange: mode === "setup" ? setupSchema : signInSchema,
        },
        onSubmit: async ({ value }) => {
            const { error } =
                mode === "setup"
                    ? await setupOwner({ data: value })
                    : await signInEmail({
                        data: { email: value.email, password: value.password },
                    })

            if (error) {
                t.error(mode === "setup" ? "Setup failed" : "Sign in failed", {
                    description: error,
                })
                return
            }
            navigate({ to: "/" })
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className={cn(
                "flex w-full max-w-sm flex-col gap-5",
                'container m-auto'
            )}
        >
            <section>
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">
                    {mode === "setup" ? "Create the owner account" : "Sign in to your account"}
                </p>
            </section>

            <div className="flex flex-col gap-3">
                {mode === "setup" && (
                    <form.Field name="name">
                        {(field) => (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor={field.name}>Name</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                />
                                {!field.state.meta.isValid && (
                                    <p className="text-xs text-destructive">
                                        {field.state.meta.errors
                                            .map((err) => err?.message)
                                            .join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>
                )}

                <form.Field name="email">
                    {(field) => (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={field.name}>Email</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type="email"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                            {!field.state.meta.isValid && (
                                <p className="text-xs text-destructive">
                                    {field.state.meta.errors
                                        .map((err) => err?.message)
                                        .join(", ")}
                                </p>
                            )}
                        </div>
                    )}
                </form.Field>

                <form.Field name="password">
                    {(field) => (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={field.name}>Password</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type="password"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                            {!field.state.meta.isValid && (
                                <p className="text-xs text-destructive">
                                    {field.state.meta.errors
                                        .map((err) => err?.message)
                                        .join(", ")}
                                </p>
                            )}
                        </div>
                    )}
                </form.Field>
            </div>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" isDisabled={!canSubmit}>
                        {isSubmitting && <IconLoader2 className="animate-spin" />}
                        {mode === "setup" ? "Create account" : "Sign in"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}
