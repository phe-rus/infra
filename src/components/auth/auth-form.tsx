import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AUTH_METHODS, type AuthMethod } from "@/auth/settings/methods"
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react"
import { signInEmail, setupOwner } from "@/functions/authFn"
import { updateAuthSettings } from "@/functions/settingsFn"
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

type AuthFormProps = {
    mode: "sign-in" | "setup"
    initialAuthMethods?: Record<AuthMethod, boolean>
}

const METHOD_LABELS: Record<AuthMethod, string> = {
    emailAndPassword: "Email & password",
    twoFactor: "Two-factor authentication",
    username: "Username sign-in",
    anonymous: "Anonymous sign-in",
    phoneNumber: "Phone number",
    magicLink: "Magic link",
    emailOTP: "Email OTP",
    passkey: "Passkeys",
    apiKey: "API keys",
}

const TOGGLEABLE_METHODS = AUTH_METHODS.filter((method) => method !== "emailAndPassword")

const authMethodsSchema = z.record(z.string(), z.boolean())

const signInSchema = z.object({
    name: z.string(),
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
    authMethods: authMethodsSchema,
})

const setupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    rememberMe: z.boolean(),
    authMethods: authMethodsSchema,
})

export function AuthForm({ mode, initialAuthMethods }: AuthFormProps) {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const defaultValues: z.input<typeof setupSchema> = {
        name: "",
        email: "",
        password: "",
        rememberMe: true,
        authMethods: initialAuthMethods ?? {},
    }

    const form = useForm({
        defaultValues,
        validators: {
            onChange: mode === "setup" ? setupSchema : signInSchema,
        },
        onSubmit: async ({ value }) => {
            if (mode === "setup") {
                const { error } = await setupOwner({
                    data: {
                        name: value.name,
                        email: value.email,
                        password: value.password,
                        rememberMe: value.rememberMe,
                    },
                })
                if (error) {
                    t.error("Setup failed", { description: error })
                    return
                }
                await updateAuthSettings({ data: value.authMethods })
                navigate({ to: "/" })
                return
            }

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

            {mode === "setup" && (
                <FieldGroup>
                    <FieldDescription>
                        {METHOD_LABELS.emailAndPassword} is always on. Enable anything else you want
                        available now — all of this stays changeable later.
                    </FieldDescription>
                    {TOGGLEABLE_METHODS.map((method) => (
                        <form.Field
                            key={method}
                            name={`authMethods.${method}`}
                            children={(field) => (
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id={field.name}
                                        name={field.name}
                                        isSelected={field.state.value}
                                        onChange={field.handleChange}
                                    />
                                    <FieldLabel htmlFor={field.name}>{METHOD_LABELS[method]}</FieldLabel>
                                </Field>
                            )}
                        />
                    ))}
                </FieldGroup>
            )}

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
