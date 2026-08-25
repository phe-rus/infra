import { oauthProvider } from "@better-auth/oauth-provider"

export type CreateOAuthProviderOptions = {
    loginPage: string
    consentPage: string
    signUpPage: string
    isAdmin: (role: string) => boolean
    scopes: string[]
    resources: string[]
}

export function createOAuthProviderPlugin(options: CreateOAuthProviderOptions) {
    return oauthProvider({
        loginPage: options.loginPage,
        consentPage: options.consentPage,
        signUp: {
            page: options.signUpPage,
        },
        storeClientSecret: "hashed",
        allowDynamicClientRegistration: false,
        clientPrivileges: async ({ user }) =>
            options.isAdmin((user?.role as string | undefined) ?? ""),
        scopes: options.scopes,
        rateLimit: {
            authorize: { window: 60, max: 50 },
            token: { window: 60, max: 30 },
            register: { window: 60, max: 5 },
        },
        accessTokenExpiresIn: 60 * 60, // 1 hour
        refreshTokenExpiresIn: 60 * 60 * 24 * 30, // 30 days, rotates forward on every use
        codeExpiresIn: 60 * 2, // 2 minutes — exchanged immediately after the redirect
        refreshTokenGracePeriod: 30,
        resources: options.resources,
        customUserInfoClaims: async ({ user, scopes, jwt }) => ({
            scopes: scopes,
            clientId: typeof jwt.client_id === "string" ? jwt.client_id : null,
            ...user,
        }),
    })
}
