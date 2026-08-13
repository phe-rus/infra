import { z } from "zod"

export const CLIENT_TYPES = ["web", "native", "user-agent-based"] as const
export type ClientType = (typeof CLIENT_TYPES)[number]

export const CLIENT_TYPE_INFO: Record<ClientType, { label: string; description: string }> = {
    web: { label: "Web", description: "Server-rendered applications — Next.js, Nuxt, Rails, etc." },
    native: { label: "Native", description: "Native mobile, desktop, or IoT applications — iOS, Android, etc." },
    "user-agent-based": {
        label: "User-agent-based",
        description: "Single-page applications — React, Vue, Angular, etc.",
    },
}

export const TOKEN_ENDPOINT_AUTH_METHODS = ["none", "client_secret_basic", "client_secret_post"] as const
export type TokenEndpointAuthMethod = (typeof TOKEN_ENDPOINT_AUTH_METHODS)[number]

export const TOKEN_ENDPOINT_AUTH_METHOD_INFO: Record<TokenEndpointAuthMethod, { label: string; description: string }> = {
    none: {
        label: "Public",
        description: "No client secret — use for SPAs and native apps that can't store one securely.",
    },
    client_secret_basic: {
        label: "Basic",
        description: "Client secret via HTTP Basic auth — use for confidential, server-side clients.",
    },
    client_secret_post: {
        label: "POST",
        description: "Client secret in the request body — use for confidential, server-side clients.",
    },
}

export const GRANT_TYPES = ["authorization_code", "client_credentials", "refresh_token"] as const
export type GrantType = (typeof GRANT_TYPES)[number]

export const GRANT_TYPE_OPTIONS: { label: string; value: GrantType }[] = [
    { label: "Authorization code — user login flows", value: "authorization_code" },
    { label: "Client credentials — machine-to-machine", value: "client_credentials" },
    { label: "Refresh token — extend sessions", value: "refresh_token" },
]

// matches the scopes configured on the oauthProvider plugin (auth/index.ts)
export const SCOPES = ["openid", "profile", "email", "offline_access"] as const
export type Scope = (typeof SCOPES)[number]

export const SCOPE_OPTIONS: { label: string; value: Scope }[] = SCOPES.map((s) => ({ label: s, value: s }))

export const CREATE_CLIENT_ID = "create-oauth2"

// not a real oauthClient column — stashed in its metadata field (which the
// plugin already supports as an arbitrary record) purely to pick a display
// icon; has no bearing on the OAuth client's actual behavior
export const FRAMEWORKS = ["react", "vue", "angular", "next", "kotlin", "swift", "flutter", "other"] as const
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
export const appFormSchema = z.object({
    client_name: z.string().min(1, "Name is required"),
    client_uri: z.string().optional(),
    logo_uri: z.string().optional(),
    framework: z.enum(FRAMEWORKS).optional(),
    type: z.enum(CLIENT_TYPES),
    token_endpoint_auth_method: z.enum(TOKEN_ENDPOINT_AUTH_METHODS),
    redirect_uris: z.string().optional(),
    post_logout_redirect_uris: z.string().optional(),
    scope: z.array(z.enum(SCOPES)),
    grant_types: z.array(z.enum(GRANT_TYPES)),
    require_pkce: z.boolean(),
    skip_consent: z.boolean(),
    enable_end_session: z.boolean(),
})

export const createAppSchema = z.object({
    client_name: z.string().min(1),
    client_uri: z.url().optional(),
    logo_uri: z.url().optional(),
    framework: z.enum(FRAMEWORKS).optional(),
    type: z.enum(CLIENT_TYPES),
    token_endpoint_auth_method: z.enum(TOKEN_ENDPOINT_AUTH_METHODS),
    redirect_uris: z.array(z.url()).optional(),
    post_logout_redirect_uris: z.array(z.url()).optional(),
    scope: z.array(z.enum(SCOPES)),
    grant_types: z.array(z.enum(GRANT_TYPES)),
    require_pkce: z.boolean(),
    skip_consent: z.boolean(),
    enable_end_session: z.boolean(),
})

// diff-only, matching updateUserDetailsSchema's convention — every field is
// optional, the console page only ever sends what actually changed
export const updateAppSchema = z.object({
    clientId: z.string().min(1),
    client_name: z.string().min(1).optional(),
    client_uri: z.url().optional(),
    logo_uri: z.url().optional(),
    framework: z.enum(FRAMEWORKS).optional(),
    redirect_uris: z.array(z.url()).min(1).optional(),
    post_logout_redirect_uris: z.array(z.url()).optional(),
    scope: z.array(z.enum(SCOPES)).optional(),
    grant_types: z.array(z.enum(GRANT_TYPES)).optional(),
    skip_consent: z.boolean().optional(),
    enable_end_session: z.boolean().optional(),
})
