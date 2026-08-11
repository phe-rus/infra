export const AUTH_METHODS = [
    "emailAndPassword",
    "twoFactor",
    "username",
    "magicLink",
    "passkey",
    "apiKey",
] as const

export type AuthMethod = (typeof AUTH_METHODS)[number]

export const DEFAULT_ENABLED_METHODS: Record<AuthMethod, boolean> = {
    emailAndPassword: true,
    twoFactor: false,
    username: false,
    magicLink: false,
    passkey: false,
    apiKey: false,
}

export const METHOD_LABELS: Record<AuthMethod, string> = {
    emailAndPassword: "Email & password",
    twoFactor: "Two-factor authentication",
    username: "Username sign-in",
    magicLink: "Magic link",
    passkey: "Passkeys",
    apiKey: "API keys",
}

export const TOGGLEABLE_METHODS = AUTH_METHODS.filter((method) => method !== "emailAndPassword")
