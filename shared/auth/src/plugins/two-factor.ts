import { twoFactor } from "better-auth/plugins"

export function createTwoFactorPlugin(issuer: string) {
    return twoFactor({
        issuer,
        backupCodeOptions: {
            amount: 10,
            storeBackupCodes: "encrypted",
        },
        twoFactorCookieMaxAge: 600, // 10 min 2FA challenge window
        trustDeviceMaxAge: 60 * 60 * 24 * 30, // 30 day trusted device
    })
}
