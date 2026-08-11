import { createMiddleware } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"
import { isRoleAllowed } from "@/auth/permissions"
import { getAllowedRoles } from "@/auth/settings/access-store"
import { auth } from "@/auth"

// the single gate for "is this session allowed to use this instance at
// all": no session -> sign in, session but not owner/admin/an allowed
// custom role -> unauthorized. There is no legitimate authenticated-but-
// unpermitted consumer path here (this is an owner-and-their-team tool,
// not a public product), so both checks living in one place is correct,
// not just DRY.
export const AuthMiddleware = createMiddleware()
    .server(async ({ next, request }) => {
        const sessions = await auth.api.getSession({
            headers: request.headers,
        })
        if (!sessions) {
            throw redirect({
                to: '/sign-in',
                replace: true
            })
        }
        const allowedRoles = await getAllowedRoles()
        if (!isRoleAllowed(sessions.user.role ?? '', allowedRoles)) {
            throw redirect({
                to: '/unauthorized',
                replace: true
            })
        }
        return next({
            context: {
                sessions,
            },
        })
    })
