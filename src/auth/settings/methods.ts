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
