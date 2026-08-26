import { z } from "zod"
// the plugin's own redirect_uris/post_logout_redirect_uris validation
// (require HTTPS except for loopback hosts, reject fragments/dangerous
// schemes) — reused here instead of plain z.url() so a rejected URL fails
// fast with a clear message from our own form, not a mystery "could not
// save" once it reaches auth.api.adminUpdateOAuthClient's stricter schema
import { SafeUrlSchema } from "@better-auth/core/utils/redirect-uri"

// matches better-auth 1.7's applicationType exactly — it collapsed what used
// to be three OAuth client profiles (web / native / user-agent-based) down to
// two, since a browser-based SPA can't hold a secret any more securely than a
// native app can, so both are "native" (public-only) now
export const CLIENT_TYPES = ["web", "native"] as const
export type ClientType = (typeof CLIENT_TYPES)[number]

export const CLIENT_TYPE_INFO: Record<
    ClientType,
    { label: string; description: string }
> = {
    web: {
        label: "Web",
        description:
            "Server-rendered applications — Next.js, Nuxt, Rails, etc.",
    },
    native: {
        label: "Native",
        description:
            "Native mobile/desktop/IoT apps and browser-based SPAs (React, Vue, Angular) — anything that can't securely hold a client secret.",
    },
}

export const TOKEN_ENDPOINT_AUTH_METHODS = [
    "none",
    "client_secret_basic",
    "client_secret_post",
] as const
export type TokenEndpointAuthMethod =
    (typeof TOKEN_ENDPOINT_AUTH_METHODS)[number]

export const TOKEN_ENDPOINT_AUTH_METHOD_INFO: Record<
    TokenEndpointAuthMethod,
    { label: string; description: string }
> = {
    none: {
        label: "Public",
        description:
            "No client secret — use for SPAs and native apps that can't store one securely.",
    },
    client_secret_basic: {
        label: "Basic",
        description:
            "Client secret via HTTP Basic auth — use for confidential, server-side clients.",
    },
    client_secret_post: {
        label: "POST",
        description:
            "Client secret in the request body — use for confidential, server-side clients.",
    },
}

export const GRANT_TYPES = [
    "authorization_code",
    "client_credentials",
    "refresh_token",
] as const
export type GrantType = (typeof GRANT_TYPES)[number]

export const GRANT_TYPE_OPTIONS: { label: string; value: GrantType }[] = [
    {
        label: "Authorization code — user login flows",
        value: "authorization_code",
    },
    {
        label: "Client credentials — machine-to-machine",
        value: "client_credentials",
    },
    { label: "Refresh token — extend sessions", value: "refresh_token" },
]

// matches the scopes configured on the oauthProvider plugin (auth/index.ts)
// — "payments" was added there without being added here, which meant it
// could never actually be granted to a client: not selectable in this form,
// and createAppSchema/updateAppSchema's z.enum(SCOPES) would reject it even
// via a direct API call
export const SCOPES = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "payments",
] as const
export type Scope = (typeof SCOPES)[number]

export const SCOPE_OPTIONS: { label: string; value: Scope }[] = SCOPES.map(
    (s) => ({
        label: s,
        value: s,
    })
)

export const CREATE_CLIENT_ID = "create-oauth2"

// not a real oauthClient column — stashed in its metadata field (which the
// plugin already supports as an arbitrary record) purely to pick a display
// icon; has no bearing on the OAuth client's actual behavior
export const FRAMEWORKS = [
    "react",
    "vue",
    "angular",
    "next",
    "kotlin",
    "swift",
    "flutter",
    "other",
] as const
export type Framework = (typeof FRAMEWORKS)[number]

export const FRAMEWORK_LABELS: Record<Framework, string> = {
    react: "React",
    vue: "Vue",
    angular: "Angular",
    next: "Next.js",
    kotlin: "Kotlin",
    swift: "Swift",
    flutter: "Flutter / Dart",
    other: "Other",
}

// the plugin requires at least one redirect URI to exist at creation time;
// name is the only field this app actually requires up front, so a blank
// redirect_uris field falls back to this loopback placeholder until it's
// filled in for real
export const PENDING_REDIRECT_URI = "http://127.0.0.1/pending"

export const appIdSchema = z.object({ clientId: z.string().min(1) })

export const setAppActiveSchema = z.object({
    clientId: z.string().min(1),
    active: z.boolean(),
})

export const appDetailSearchSchema = z.object({
    secret: z.string().optional(),
})

// the console page's form: redirect_uris/post_logout_redirect_uris are
// comma-separated text here (one textarea each), split into arrays only
// when building the server payload — kept separate from the server-facing
// schemas below since the shapes genuinely differ, not just cosmetically
export const appFormSchema = z
    .object({
        client_name: z.string().min(1, "Name is required"),
        client_uri: z.string().optional(),
        logo_uri: z.string().optional(),
        framework: z.enum(FRAMEWORKS).optional(),
        application_type: z.enum(CLIENT_TYPES),
        token_endpoint_auth_method: z.enum(TOKEN_ENDPOINT_AUTH_METHODS),
        redirect_uris: z.string().optional(),
        post_logout_redirect_uris: z.string().optional(),
        scope: z.array(z.enum(SCOPES)),
        grant_types: z.array(z.enum(GRANT_TYPES)),
        require_pkce: z.boolean(),
        skip_consent: z.boolean(),
        enable_end_session: z.boolean(),
    })
    // matches the OAuth-provider plugin's own constraint (confirmed live:
    // it rejects this combination with "Type must be 'web' for confidential
    // applications") — a browser-based client can't securely hold a secret,
    // so anything other than "web" must stay a public (no-secret) client
    .refine(
        (data) =>
            data.application_type === "web" ||
            data.token_endpoint_auth_method === "none",
        {
            message:
                "Only a Web application can use a client secret — set confidentiality to Public",
            path: ["token_endpoint_auth_method"],
        }
    )

export const createAppSchema = z.object({
    client_name: z.string().min(1),
    client_uri: z.url().optional(),
    logo_uri: z.url().optional(),
    framework: z.enum(FRAMEWORKS).optional(),
    application_type: z.enum(CLIENT_TYPES),
    token_endpoint_auth_method: z.enum(TOKEN_ENDPOINT_AUTH_METHODS),
    // no .min(1) here, unlike updateAppSchema below: the create form lets
    // redirect_uris come through empty on purpose (createApp's own handler
    // falls back to PENDING_REDIRECT_URI when it does), so requiring at
    // least one here would reject the exact input that fallback exists for
    redirect_uris: z.array(SafeUrlSchema).optional(),
    post_logout_redirect_uris: z.array(SafeUrlSchema).min(1).optional(),
    scope: z.array(z.enum(SCOPES)),
    grant_types: z.array(z.enum(GRANT_TYPES)),
    require_pkce: z.boolean(),
    skip_consent: z.boolean(),
    enable_end_session: z.boolean(),
})

// diff-only, matching updateUserDetailsSchema's convention — every field is
// optional, the console page only ever sends what actually changed. The
// .min(1) on both URL arrays matches adminUpdateOAuthClient's own schema:
// neither list can be cleared to empty, only replaced with a new non-empty
// list — sending [] here fails validation before it ever reaches the plugin
export const updateAppSchema = z.object({
    clientId: z.string().min(1),
    client_name: z.string().min(1).optional(),
    client_uri: z.url().optional(),
    logo_uri: z.url().optional(),
    framework: z.enum(FRAMEWORKS).optional(),
    redirect_uris: z.array(SafeUrlSchema).min(1).optional(),
    post_logout_redirect_uris: z.array(SafeUrlSchema).min(1).optional(),
    scope: z.array(z.enum(SCOPES)).optional(),
    grant_types: z.array(z.enum(GRANT_TYPES)).optional(),
    skip_consent: z.boolean().optional(),
    enable_end_session: z.boolean().optional(),
})

export type OAuthClientRow = {
    id: string
    clientId: string
    name: string | null
    uri: string | null
    icon: string | null
    applicationType: string | null
    disabled: boolean | null
    redirectUris: string[] | null
    postLogoutRedirectUris: string[] | null
    grantTypes: string[] | null
    scopes: string[] | null
    tokenEndpointAuthMethod: string | null
    requirePKCE: boolean | null
    skipConsent: boolean | null
    enableEndSession: boolean | null
    metadata: { framework?: string } | null
    userId: string | null
    createdAt: Date
    updatedAt: Date
}

export const APP_SELECT = [
    "id",
    "clientId",
    "name",
    "uri",
    "icon",
    "applicationType",
    "disabled",
    "redirectUris",
    "postLogoutRedirectUris",
    "grantTypes",
    "scopes",
    "tokenEndpointAuthMethod",
    "requirePKCE",
    "skipConsent",
    "enableEndSession",
    "metadata",
    "userId",
    "createdAt",
    "updatedAt",
] as const
