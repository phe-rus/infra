import type { RequestIdVariables } from "hono/request-id"
import type { auth } from "../auth/auth"


export type AppTypes = {
    Bindings: Env
    Variables: RequestIdVariables & {
        user: typeof auth.$Infer.Session.user | null
        session: typeof auth.$Infer.Session.session | null
    }
}
