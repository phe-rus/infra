import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react"
import { signInEmail } from "@/functions/authFn"
import { useNavigate } from "@tanstack/react-router"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useForm } from "@tanstack/react-form"
import { Input } from "@/components/ui/input"
import { t } from "@/components/ui/sonner"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { z } from "zod"

const signInSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
})

export function AuthForm() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm({
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
                t.error("Sign in failed", { description: error })
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
            className={cn("flex w-full md:max-w-md flex-col gap-5", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">Sign in to your account</p>
            </section>

            <FieldGroup>
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
                                        autoComplete="current-password"
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

                <form.Field
                    name="rememberMe"
                    children={(field) => (
                        <Field orientation="horizontal">
                            <Checkbox
                                id={field.name}
                                name={field.name}
                                isSelected={field.state.value}
                                onChange={field.handleChange}
                            />
                            <FieldLabel htmlFor={field.name}>Remember me</FieldLabel>
                        </Field>
                    )}
                />
            </FieldGroup>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" isDisabled={!canSubmit}>
                        {isSubmitting && <IconLoader2 className="animate-spin" />}
                        Sign in
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}
