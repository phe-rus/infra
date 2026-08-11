import type { CustomRole } from "@/types"
import type { SecuritySettings } from "@/auth/settings/security"
import type { EmailPasswordSettings } from "@/auth/settings/email-password"
import type { AuthMethod } from "@/auth/settings/methods"
import { IconLoader2 } from "@tabler/icons-react"
import { runSetupMigrations } from "@/functions/setupFn"
import { useCompleteSetup } from "@/hooks/setupHooks"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/components/widgets/blocks"
import { t } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { wizardSchema } from "@/schemas/setup"
import { STEPS, type WizardValues } from "./schema"
import { BasicStep, SecurityStep, ProvidersStep, RolesStep, OwnerStep } from "./steps"

const STEP_FOR_FIELD: Record<string, (typeof STEPS)[number]> = {
    appName: "Basics",
    useSecureCookies: "Security",
    crossSubDomainCookies: "Security",
    cookieDomain: "Security",
    requireEmailVerification: "Providers",
    authMethods: "Providers",
    customRoles: "Roles",
    name: "Owner",
    email: "Owner",
    password: "Owner",
    rememberMe: "Owner",
}

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
    const { mutateAsync: completeSetup } = useCompleteSetup()
    const [step, setStep] = useState(0)
    const [migrating, setMigrating] = useState(false)
    const [migrated, setMigrated] = useState(false)

    const form = useAppForm({
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
        // Without this, TanStack Form silently no-ops handleSubmit() whenever
        // any field across ANY step is invalid — including ones not visible
        // on the current step — so clicking Continue can look like it does
        // nothing at all. We validate explicitly below instead, so there's
        // always a toast telling you what's wrong and where.
        canSubmitWhenInvalid: true,
        onSubmit: async ({ value }) => {
            const parsed = wizardSchema.safeParse(value)
            if (!parsed.success) {
                const issue = parsed.error.issues[0]
                const field = String(issue.path[0] ?? "")
                const stepLabel = STEP_FOR_FIELD[field] ?? "an earlier step"
                t.error(`Check the ${stepLabel} step`, { description: issue.message })
                return
            }

            await completeSetup({
                data: {
                    name: value.name,
                    email: value.email,
                    password: value.password,
                    rememberMe: value.rememberMe,
                    appName: value.appName,
                    security: {
                        useSecureCookies: value.useSecureCookies,
                        crossSubDomainCookies: value.crossSubDomainCookies,
                        cookieDomain: value.cookieDomain,
                    },
                    emailPassword: { requireEmailVerification: value.requireEmailVerification },
                    authMethods: value.authMethods,
                    customRoles: value.customRoles,
                },
            })
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

            <form.AppForm>
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

                    {step === 4 && <form.submit label="Continue" />}
                </div>
            </form.AppForm>
        </form>
    )
}

function Stepper({ step }: { step: number }) {
    return (
        <ol
            className={cn(
                "flex items-center gap-x-1.5 gap-y-2 text-xs text-muted-foreground",
                "overflow-x-auto truncate no-scrollbar px-0"
            )}
        >
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
