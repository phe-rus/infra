import { admin } from "better-auth/plugins"
import { ac, buildRoles } from "../core/permissions"

export function createAdminPlugin() {
    return admin({
        ac,
        roles: buildRoles(),
        defaultRole: "user",
        adminRoles: ["owner", "admin"],
    })
}
