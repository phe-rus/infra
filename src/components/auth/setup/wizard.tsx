import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AUTH_METHODS, type AuthMethod } from "@/auth/settings/methods"
import { PERMISSION_STATEMENTS, permissionLabel, FIXED_ROLE_NAMES } from "@/auth/permissions"
import type { CustomRole } from "@/auth/settings/roles-store"
import type { SecuritySettings } from "@/auth/settings/security"
import type { EmailPasswordSettings } from "@/auth/settings/email-password"
import { IconEye, IconEyeOff, IconLoader2, IconPlus, IconX } from "@tabler/icons-react"
import { setupOwner } from "@/functions/authFn"
import { runSetupMigrations } from "@/functions/setupFn"
import { updateAppName } from "@/functions/instanceFn"
import {
    updateAuthSettings,
    updateEmailPasswordAuthSettings,
    updateSecurityAuthSettings,
} from "@/functions/settingsFn"
import { updateCustomRolesFn } from "@/functions/rolesFn"
import { useNavigate } from "@tanstack/react-router"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm, type ReactFormExtendedApi } from "@tanstack/react-form"
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

const STEPS = ["Basics", "Security", "Providers", "Roles", "Owner"] as const

const wizardSchema = z.object({
    appName: z.string().min(1, "App name is required"),
    useSecureCookies: z.boolean(),
    crossSubDomainCookies: z.boolean(),
    cookieDomain: z.string(),
    requireEmailVerification: z.boolean(),
    authMethods: z.record(z.string(), z.boolean()),
    customRoles: z.array(
        z.object({
            name: z.string().min(1),
            permissions: z.object({
                user: z.array(z.string()),
                session: z.array(z.string()),
            }),
            adminTier: z.boolean(),
        })
    ),
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    rememberMe: z.boolean(),
})

type WizardValues = z.input<typeof wizardSchema>

// Only TFormData is pinned; the other 11 params only shape validator-callback
// signatures the step components never touch (they just read/write field
// values), so `any` there is safe and avoids hand-matching TanStack Form's
// internal validator generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WizardForm = ReactFormExtendedApi<
    WizardValues,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
>

type SetupWizardProps = {
    initialAppName: string
    initialSecurity: SecuritySettings
    initialEmailPassword: EmailPasswordSettings
    initialAuthMethods: Record<AuthMethod, boolean>
    initialCustomRoles: CustomRole[]
}

export function SetupWizard({
    initialAppName,
    initialSecurity,
    initialEmailPassword,
    initialAuthMethods,
    initialCustomRoles,
}: SetupWizardProps) {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [migrating, setMigrating] = useState(false)
    const [migrated, setMigrated] = useState(false)

    const form = useForm({
        defaultValues: {
            appName: initialAppName,
            useSecureCookies: initialSecurity.useSecureCookies,
            crossSubDomainCookies: initialSecurity.crossSubDomainCookies,
            cookieDomain: initialSecurity.cookieDomain,
            requireEmailVerification: initialEmailPassword.requireEmailVerification,
            authMethods: initialAuthMethods,
            customRoles: initialCustomRoles,
            name: "",
            email: "",
            password: "",
            rememberMe: true,
        } as WizardValues,
        validators: {
            onChange: wizardSchema,
        },
        onSubmit: async ({ value }) => {
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

            await Promise.all([
                updateAppName({ data: { appName: value.appName } }),
                updateSecurityAuthSettings({
                    data: {
                        useSecureCookies: value.useSecureCookies,
                        crossSubDomainCookies: value.crossSubDomainCookies,
                        cookieDomain: value.cookieDomain,
                    },
                }),
                updateEmailPasswordAuthSettings({
                    data: { requireEmailVerification: value.requireEmailVerification },
                }),
                updateAuthSettings({ data: value.authMethods }),
                updateCustomRolesFn({ data: value.customRoles }),
            ])

            t.success("Setup complete", { description: "Welcome to Infra." })
            navigate({ to: "/" })
        },
    })

    async function goToOwnerStep() {
        if (migrated) {
            setStep(4)
            return
        }
        setMigrating(true)
        try {
            await runSetupMigrations()
            setMigrated(true)
            setStep(4)
        } catch (error) {
            t.error("Could not prepare the database", {
                description: error instanceof Error ? error.message : "Migration failed",
            })
        } finally {
            setMigrating(false)
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                void form.handleSubmit()
            }}
            className={cn("flex w-full md:max-w-lg flex-col gap-6", "container m-auto py-10")}
        >
            <section>
                <h1 className="text-3xl">Infra</h1>
                <p className="text-muted-foreground">Set up your instance</p>
            </section>

            <Stepper step={step} />

            {step === 0 && <BasicStep form={form} />}
            {step === 1 && <SecurityStep form={form} />}
            {step === 2 && <ProvidersStep form={form} />}
            {step === 3 && <RolesStep form={form} />}
            {step === 4 && <OwnerStep form={form} />}

            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    isDisabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                    Back
                </Button>

                {step < 3 && (
                    <Button type="button" onClick={() => setStep((s) => s + 1)}>
                        Next
                    </Button>
                )}

                {step === 3 && (
                    <Button type="button" isDisabled={migrating} onClick={() => void goToOwnerStep()}>
                        {migrating && <IconLoader2 className="animate-spin" />}
                        {migrating ? "Setting up database…" : "Next"}
                    </Button>
                )}

                {step === 4 && (
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                        {([canSubmit, isSubmitting]) => (
                            <Button type="submit" isDisabled={!canSubmit}>
                                {isSubmitting && <IconLoader2 className="animate-spin" />}
                                Continue
                            </Button>
                        )}
                    </form.Subscribe>
                )}
            </div>
        </form>
    )
}

function Stepper({ step }: { step: number }) {
    return (
        <ol className={cn(
            "flex items-center gap-x-1.5 gap-y-2 text-xs text-muted-foreground",
            'overflow-x-auto truncate no-scrollbar px-0'
        )}>
            {STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-none border border-input text-[10px]",
                            i === step && "border-primary bg-primary text-primary-foreground",
                            i < step && "border-primary/40 bg-primary/10 text-foreground"
                        )}
                    >
                        {i + 1}
                    </span>
                    <span className={cn(i === step && "text-foreground")}>{label}</span>
                    {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
                </li>
            ))}
        </ol>
    )
}

function BasicStep({ form }: { form: WizardForm }) {
    return (
        <FieldGroup>
            <FieldDescription>Name your instance. You can change this later.</FieldDescription>
            <form.Field
                name="appName"
                children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>App name</FieldLabel>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                aria-invalid={isInvalid}
                                placeholder="Infra"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )
                }}
            />
        </FieldGroup>
    )
}

function SecurityStep({ form }: { form: WizardForm }) {
    return (
        <FieldGroup>
            <FieldDescription>
                Controls how session cookies are issued. Leave these off for a single-domain local
                setup.
            </FieldDescription>
            <form.Field
                name="useSecureCookies"
                children={(field) => (
                    <Field orientation="horizontal">
                        <Checkbox
                            id={field.name}
                            name={field.name}
                            isSelected={field.state.value}
                            onChange={field.handleChange}
                        />
                        <FieldLabel htmlFor={field.name}>Use secure cookies (HTTPS only)</FieldLabel>
                    </Field>
                )}
            />
            <form.Field
                name="crossSubDomainCookies"
                children={(field) => (
                    <Field orientation="horizontal">
                        <Checkbox
                            id={field.name}
                            name={field.name}
                            isSelected={field.state.value}
                            onChange={field.handleChange}
                        />
                        <FieldLabel htmlFor={field.name}>Share cookies across subdomains</FieldLabel>
                    </Field>
                )}
            />
            <form.Subscribe selector={(state) => state.values.crossSubDomainCookies}>
                {(enabled) =>
                    enabled && (
                        <form.Field
                            name="cookieDomain"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name}>Cookie domain</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder=".example.com"
                                    />
                                </Field>
                            )}
                        />
                    )
                }
            </form.Subscribe>
        </FieldGroup>
    )
}

function ProvidersStep({ form }: { form: WizardForm }) {
    return (
        <FieldGroup>
            <FieldDescription>
                {METHOD_LABELS.emailAndPassword} is always on. Enable anything else you want available
                now — all of this stays changeable later.
            </FieldDescription>

            <form.Field
                name="requireEmailVerification"
                children={(field) => (
                    <Field orientation="horizontal">
                        <Checkbox
                            id={field.name}
                            name={field.name}
                            isSelected={field.state.value}
                            onChange={field.handleChange}
                        />
                        <FieldLabel htmlFor={field.name}>Require email verification</FieldLabel>
                    </Field>
                )}
            />

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
    )
}

const FIXED_ROLE_COPY: Record<(typeof FIXED_ROLE_NAMES)[number], string> = {
    owner: "Full access. Automatically assigned to the account you're about to create — there's only ever one.",
    admin: "Full access, same as owner. Assign this to other trusted users later.",
    user: "No elevated permissions. The default role for anyone who signs up.",
}

function RolesStep({ form }: { form: WizardForm }) {
    const [draftName, setDraftName] = useState("")
    const [draftPermissions, setDraftPermissions] = useState<{ user: string[]; session: string[] }>({
        user: [],
        session: [],
    })
    const [draftAdminTier, setDraftAdminTier] = useState(false)

    function toggleDraftPermission(resource: "user" | "session", action: string) {
        setDraftPermissions((prev) => {
            const current = prev[resource]
            const next = current.includes(action)
                ? current.filter((a) => a !== action)
                : [...current, action]
            return { ...prev, [resource]: next }
        })
    }

    return (
        <FieldGroup>
            <FieldDescription>
                Roles control what a user can do. Owner, admin, and user always exist — add more if you
                need finer-grained access.
            </FieldDescription>

            <div className="flex flex-col gap-2">
                {FIXED_ROLE_NAMES.map((name) => (
                    <Card key={name} size="sm">
                        <CardHeader>
                            <CardTitle className="capitalize">{name}</CardTitle>
                            <CardDescription>{FIXED_ROLE_COPY[name]}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <form.Field
                name="customRoles"
                children={(field) => (
                    <div className="flex flex-col gap-3">
                        {field.state.value.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {field.state.value.map((role, index) => (
                                    <Card key={`${role.name}-${index}`} size="sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-2">
                                                    {role.name}
                                                    {role.adminTier && <Badge variant="secondary">Elevated</Badge>}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    aria-label={`Remove ${role.name}`}
                                                    onClick={() => field.removeValue(index)}
                                                >
                                                    <IconX />
                                                </Button>
                                            </CardTitle>
                                            <CardDescription>
                                                {[...role.permissions.user, ...role.permissions.session]
                                                    .map(permissionLabel)
                                                    .join(", ") || "No permissions selected"}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <Card size="sm">
                            <CardHeader>
                                <CardTitle>Add a role</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <Field>
                                    <FieldLabel htmlFor="new-role-name">Role name</FieldLabel>
                                    <Input
                                        id="new-role-name"
                                        value={draftName}
                                        onChange={(e) => setDraftName(e.target.value)}
                                        placeholder="e.g. support"
                                    />
                                </Field>

                                {(["user", "session"] as const).map((resource) => (
                                    <div key={resource} className="flex flex-col gap-1.5">
                                        <FieldLabel className="capitalize">{resource} permissions</FieldLabel>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                            {PERMISSION_STATEMENTS[resource].map((action) => (
                                                <Field key={action} orientation="horizontal" className="w-fit">
                                                    <Checkbox
                                                        isSelected={draftPermissions[resource].includes(action)}
                                                        onChange={() => toggleDraftPermission(resource, action)}
                                                    />
                                                    <FieldLabel>{permissionLabel(action)}</FieldLabel>
                                                </Field>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <Field orientation="horizontal">
                                    <Checkbox isSelected={draftAdminTier} onChange={setDraftAdminTier} />
                                    <FieldLabel>Grant elevated (admin) access</FieldLabel>
                                </Field>

                                <Button
                                    type="button"
                                    variant="outline"
                                    isDisabled={!draftName.trim()}
                                    onClick={() => {
                                        field.pushValue({
                                            name: draftName.trim(),
                                            permissions: draftPermissions,
                                            adminTier: draftAdminTier,
                                        })
                                        setDraftName("")
                                        setDraftPermissions({ user: [], session: [] })
                                        setDraftAdminTier(false)
                                    }}
                                >
                                    <IconPlus /> Add role
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            />
        </FieldGroup>
    )
}

function OwnerStep({ form }: { form: WizardForm }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <FieldGroup>
            <FieldDescription>
                This account is the instance owner — it has full access to everything.
            </FieldDescription>

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
                                placeholder="Enter your name"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )
                }}
            />

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
                                placeholder="Enter your email"
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
                                    autoComplete="new-password"
                                    placeholder="Enter your password"
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
    )
}
