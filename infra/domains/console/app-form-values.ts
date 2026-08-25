import type { z } from "zod"
import type { AppDetail } from "./fnc"
import type {
    appFormSchema,
    ClientType,
    Framework,
    GrantType,
    Scope,
    TokenEndpointAuthMethod,
} from "./schema"

type ChangedFields = Partial<{
    client_name: string
    client_uri: string
    logo_uri: string
    framework: Framework
    redirect_uris: string[]
    post_logout_redirect_uris: string[]
    scope: Scope[]
    grant_types: GrantType[]
    skip_consent: boolean
    enable_end_session: boolean
}>

export const CREATE_DEFAULT_VALUES: z.input<typeof appFormSchema> = {
    client_name: "",
    client_uri: "",
    logo_uri: "",
    framework: undefined,
    application_type: "native",
    token_endpoint_auth_method: "none",
    redirect_uris: "",
    post_logout_redirect_uris: "",
    scope: ["openid", "profile", "email"],
    grant_types: ["authorization_code"],
    require_pkce: true,
    skip_consent: false,
    enable_end_session: false,
}

export function editDefaultValues(
    application: AppDetail | undefined
): z.input<typeof appFormSchema> {
    return {
        client_name: application?.name ?? "",
        client_uri: application?.uri ?? "",
        logo_uri: application?.icon ?? "",
        framework:
            (application?.framework as Framework | undefined) ?? undefined,
        application_type:
            (application?.applicationType as ClientType | undefined) ??
            "native",
        token_endpoint_auth_method:
            (application?.tokenEndpointAuthMethod as
                | TokenEndpointAuthMethod
                | undefined) ?? "none",
        redirect_uris: (application?.redirectUris ?? []).join(","),
        post_logout_redirect_uris: (
            application?.postLogoutRedirectUris ?? []
        ).join(","),
        scope: (application?.scopes as Scope[] | undefined) ?? [],
        grant_types: (application?.grantTypes as GrantType[] | undefined) ?? [],
        require_pkce: Boolean(application?.requirePKCE),
        skip_consent: Boolean(application?.skipConsent),
        enable_end_session: Boolean(application?.enableEndSession),
    }
}

// only the fields that actually differ from the application's current
// values — updateApp should send a targeted patch, not the whole form
export function computeChangedFields(
    value: z.input<typeof appFormSchema>,
    application: NonNullable<AppDetail>,
    redirectUris: string[],
    postLogoutRedirectUris: string[] | undefined
): ChangedFields {
    return {
        ...(value.client_name !== application.name && {
            client_name: value.client_name,
        }),
        ...((value.client_uri || undefined) !==
            (application.uri ?? undefined) && {
            client_uri: value.client_uri || undefined,
        }),
        ...((value.logo_uri || undefined) !==
            (application.icon ?? undefined) && {
            logo_uri: value.logo_uri || undefined,
        }),
        ...(value.framework !== (application.framework ?? undefined) &&
            value.framework && { framework: value.framework }),
        ...(JSON.stringify(redirectUris) !==
            JSON.stringify(application.redirectUris) && {
            redirect_uris: redirectUris,
        }),
        ...(JSON.stringify(postLogoutRedirectUris ?? []) !==
            JSON.stringify(application.postLogoutRedirectUris) && {
            post_logout_redirect_uris: postLogoutRedirectUris,
        }),
        ...(JSON.stringify([...value.scope].sort()) !==
            JSON.stringify([...application.scopes].sort()) && {
            scope: value.scope,
        }),
        ...(JSON.stringify([...value.grant_types].sort()) !==
            JSON.stringify([...application.grantTypes].sort()) && {
            grant_types: value.grant_types,
        }),
        ...(value.skip_consent !== Boolean(application.skipConsent) && {
            skip_consent: value.skip_consent,
        }),
        ...(value.enable_end_session !==
            Boolean(application.enableEndSession) && {
            enable_end_session: value.enable_end_session,
        }),
    }
}

export function infraConfigSnippet(
    clientId: string,
    clientSecret: string | null
): string {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    return `const infraConfig = {
  clientId: "${clientId}",
  ${clientSecret ? `clientSecret: "${clientSecret}", // shown once, copy it now\n  ` : ""}authUrl: "${origin}/api/auth",
}`
}
