import { authMiddleware } from "@/middleware/auth.middleware"
import { createServerFn } from "@tanstack/react-start"
import { queryOptions } from "@tanstack/react-query"

export const currentUser = createServerFn()
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        return context.session
    })

export const currentOptions = () => queryOptions({
    queryKey: ["me"],
    queryFn: () => currentUser(),
})