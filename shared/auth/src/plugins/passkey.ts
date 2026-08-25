import { passkey } from "@better-auth/passkey"

export function createPasskeyPlugin(options: {
    appName: string
    isProduction: boolean
    cookieDomain?: string
}) {
    return passkey({
        rpName: options.appName,
        rpID: options.isProduction ? options.cookieDomain : undefined,
    })
}
