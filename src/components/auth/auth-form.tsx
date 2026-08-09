import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react"
import { z } from "zod"
import { signInEmail, setupOwner } from "@/functions/authFn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
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
    const [showPassword, setShowPassword] = useState(false)

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
            className={cn("flex w-full max-w-sm flex-col gap-5", "container m-auto")}
        >
            <section>
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">
                    {mode === "setup" ? "Create the owner account" : "Sign in to your account"}
                </p>
            </section>

            <FieldGroup>
                {mode === "setup" && (
                    <form.Field
                        name="name"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        autoComplete="name"
                                        placeholder='Enter your name'
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )
                        }}
                    />
                )}

                <form.Field
                    name="email"
                    children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="email"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    aria-invalid={isInvalid}
                                    autoComplete="email"
                                    placeholder='Enter your email'
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name="password"
                    children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id={field.name}
                                        name={field.name}
                                        type={showPassword ? "text" : "password"}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        autoComplete={mode === "setup" ? "new-password" : "current-password"}
                                        placeholder='Enter your password'
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                            type="button"
                                            size="icon-xs"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            {showPassword ? <IconEyeOff /> : <IconEye />}
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                </InputGroup>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )
                    }}
                />
            </FieldGroup>

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
