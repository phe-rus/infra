import { authMiddleware } from "@/middleware"
import { createServerFn } from "@tanstack/react-start"

export const currentUser = createServerFn()
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        return context.session
    })

export type CurrentUserData = Awaited<ReturnType<typeof currentUser>>
