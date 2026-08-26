import { admin, jwt, twoFactor } from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { oauthProvider } from "@better-auth/oauth-provider"
import type { BetterAuthOptions } from "better-auth/types"
import { listUserAccounts } from "./core/admin-accounts"

type OptionsProps = Partial<BetterAuthOptions>

export type CreateOAuthProviderOptions = {
    loginPage: string
    consentPage: string
    signUpPage: string
    isAdmin: (role: string) => boolean
    scopes: string[]
    resources: string[]
}

export type ConfigOptions = {
    appName: string
    isProduction: boolean
    cookieDomain?: string
    oauth: CreateOAuthProviderOptions
}

export const config = (options: ConfigOptions) =>
    [
        admin(),
        listUserAccounts({ isAdmin: options.oauth.isAdmin }),
        twoFactor({
            issuer: options.appName,
            backupCodeOptions: {
                amount: 10,
                storeBackupCodes: "encrypted",
            },
            twoFactorCookieMaxAge: 600, // 10 min 2FA challenge window
            trustDeviceMaxAge: 60 * 60 * 24 * 30, // 30 day trusted device
        }),
        passkey({
            rpName: options.appName,
            rpID: options.isProduction
                ? options.cookieDomain
                : undefined,
        }),
        jwt({
            disableSettingJwtHeader: true,
        }),
        oauthProvider({
            loginPage: options.oauth.loginPage,
            consentPage: options.oauth.consentPage,
            signUp: {
                page: options.oauth.signUpPage,
            },
            storeClientSecret: "hashed",
            allowDynamicClientRegistration: false,
            clientPrivileges: async ({ user }) => {
                return options.oauth.isAdmin(
                    (user?.role as string | undefined) ?? ""
                )
            },
            scopes: options.oauth.scopes,
            rateLimit: {
                authorize: { window: 60, max: 50 },
                token: { window: 60, max: 30 },
                register: { window: 60, max: 5 },
            },
            accessTokenExpiresIn: 60 * 60, // 1 hour
            refreshTokenExpiresIn: 60 * 60 * 24 * 30, // 30 days, rotates forward on every use
            codeExpiresIn: 60 * 2, // 2 minutes — exchanged immediately after the redirect
            refreshTokenGracePeriod: 30,
            resources: options.oauth.resources,
            customUserInfoClaims: async ({ user, scopes, jwt }) => ({
                scopes: scopes,
                clientId:
                    typeof jwt.client_id === "string"
                        ? jwt.client_id
                        : null,
                ...user,
            }),
        }),
    ] satisfies OptionsProps["plugins"]
