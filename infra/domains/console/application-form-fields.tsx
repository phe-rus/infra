import { useEffect } from "react"
import { FieldGroup } from "@infra/ui/components/field"
import { useSelector, withForm } from "@infra/ui/widgets/blocks"
import { FrameworkIcon } from "@/domains/console/framework-icon"
import {
    CLIENT_TYPE_INFO,
    CLIENT_TYPES,
    FRAMEWORK_LABELS,
    FRAMEWORKS,
    GRANT_TYPE_OPTIONS,
    SCOPE_OPTIONS,
    TOKEN_ENDPOINT_AUTH_METHOD_INFO,
    TOKEN_ENDPOINT_AUTH_METHODS,
} from "@/domains/console"
import type { appFormSchema } from "@/domains/console"
import type { z } from "zod"

// shape only, for withForm's type inference — the real defaults come from
// whichever form instance the route passes in
const defaultValues: z.input<typeof appFormSchema> = {
    client_name: "",
    client_uri: "",
    logo_uri: "",
    framework: undefined,
    application_type: "native",
    token_endpoint_auth_method: "none",
    redirect_uris: "",
    post_logout_redirect_uris: "",
    scope: [],
    grant_types: [],
    require_pkce: true,
    skip_consent: false,
    enable_end_session: false,
}

// the create/edit OAuth-client form fields — same set for both flows,
// several fields just become disabled once a client already exists
export const ApplicationFormFields = withForm({
    defaultValues,
    props: {
        isCreate: false,
    },
    render: ({ form, isCreate }) => {
        // a browser-based client can't securely hold a secret — the
        // OAuth-provider plugin rejects anything but "none" (Public) for a
        // non-"web" type, so mirror that constraint in the UI instead of
        // letting the user pick an invalid combination and find out on submit
        const applicationType = useSelector(form.store, (state) => state.values.application_type)
        const confidentialityLocked = applicationType !== "web"

        useEffect(() => {
            if (
                confidentialityLocked &&
                form.getFieldValue("token_endpoint_auth_method") !== "none"
            ) {
                form.setFieldValue("token_endpoint_auth_method", "none")
            }
        }, [confidentialityLocked, form])

        return (
            <FieldGroup className="grid grid-cols-1 gap-4">
                <form.AppField
                    name="client_name"
                    children={(field) => <field.input label="Name" placeholder="My Application" />}
                />

                <form.AppField
                    name="client_uri"
                    children={(field) => (
                        <field.input
                            label="Application homepage URI (optional)"
                            placeholder="https://www.example.com"
                        />
                    )}
                />

                <form.AppField
                    name="logo_uri"
                    children={(field) => (
                        <field.input
                            label="Logo URI (optional)"
                            placeholder="https://www.example.com/logo.png"
                        />
                    )}
                />

                <form.AppField
                    name="framework"
                    children={(field) => (
                        <field.radioCard
                            label="Framework (optional)"
                            description="Used to pick a display icon — has no effect on how the client behaves."
                            columns={2}
                            options={FRAMEWORKS.filter((f) => f !== "other").map((framework) => ({
                                value: framework,
                                label: FRAMEWORK_LABELS[framework],
                                icon: <FrameworkIcon framework={framework} className="size-4" />,
                            }))}
                        />
                    )}
                />

                <form.AppField
                    name="application_type"
                    children={(field) => (
                        <field.radioCard
                            label="Type"
                            disabled={!isCreate}
                            columns={2}
                            description={
                                isCreate
                                    ? "You can't change this later."
                                    : "This can't be edited after creation."
                            }
                            options={CLIENT_TYPES.map((clientType) => ({
                                value: clientType,
                                ...CLIENT_TYPE_INFO[clientType],
                            }))}
                        />
                    )}
                />

                <form.AppField
                    name="token_endpoint_auth_method"
                    children={(field) => (
                        <field.radioCard
                            label="Client confidentiality"
                            disabled={!isCreate}
                            description={
                                !isCreate
                                    ? "This can't be edited after creation."
                                    : confidentialityLocked
                                      ? "Only a Web application can use a client secret."
                                      : "You can't change this later."
                            }
                            options={TOKEN_ENDPOINT_AUTH_METHODS.map((method) => ({
                                value: method,
                                ...TOKEN_ENDPOINT_AUTH_METHOD_INFO[method],
                                disabled: confidentialityLocked && method !== "none",
                            }))}
                        />
                    )}
                />

                <form.AppField
                    name="redirect_uris"
                    children={(field) => (
                        <field.textarea
                            label="Allowed callback URLs (optional)"
                            placeholder="https://myapp.com/callback, https://myapp.com/auth"
                        />
                    )}
                />

                <form.AppField
                    name="post_logout_redirect_uris"
                    children={(field) => (
                        <field.textarea
                            label="Allowed logout redirect URLs (optional)"
                            placeholder="https://myapp.com, https://myapp.com/signed-out"
                        />
                    )}
                />

                <form.AppField
                    name="grant_types"
                    children={(field) => (
                        <field.multiselect label="Grant types" options={GRANT_TYPE_OPTIONS} />
                    )}
                />

                <form.AppField
                    name="scope"
                    children={(field) => (
                        <field.multiselect label="Scopes" options={SCOPE_OPTIONS} />
                    )}
                />

                <form.AppField
                    name="require_pkce"
                    children={(field) => (
                        <field.switch
                            label="Require PKCE"
                            disabled={!isCreate}
                            description={
                                isCreate ? undefined : "This can't be edited after creation."
                            }
                        />
                    )}
                />

                <form.AppField
                    name="skip_consent"
                    children={(field) => (
                        <field.switch
                            label="Skip consent screen"
                            description="Trusted clients only."
                        />
                    )}
                />

                <form.AppField
                    name="enable_end_session"
                    children={(field) => (
                        <field.switch
                            label="Enable end session"
                            description="RP-initiated logout (OIDC front-channel/back-channel logout)."
                        />
                    )}
                />
            </FieldGroup>
        )
    },
})
