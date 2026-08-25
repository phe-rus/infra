import { jwt } from "better-auth/plugins"

export function createJwtPlugin() {
    return jwt({
        disableSettingJwtHeader: true,
    })
}
