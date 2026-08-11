import { z } from "zod"
import { customRoleSchema } from "./role"

export const teamRolesSchema = z.object({
    customRoles: z.array(customRoleSchema),
    allowedRoles: z.array(z.string()),
})
