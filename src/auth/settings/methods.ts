export const AUTH_METHODS = [
    "emailAndPassword",
    "twoFactor",
    "username",
    "anonymous",
    "phoneNumber",
    "magicLink",
    "emailOTP",
    "passkey",
    "apiKey",
] as const

export type AuthMethod = (typeof AUTH_METHODS)[number]

export const DEFAULT_ENABLED_METHODS: Record<AuthMethod, boolean> = {
    emailAndPassword: true,
    twoFactor: false,
    username: false,
    anonymous: false,
    phoneNumber: false,
    magicLink: false,
    emailOTP: false,
    passkey: false,
    apiKey: false,
}

export const METHOD_LABELS: Record<AuthMethod, string> = {
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

export const TOGGLEABLE_METHODS = AUTH_METHODS.filter((method) => method !== "emailAndPassword")
