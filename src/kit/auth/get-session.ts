import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/auth"

// Non-throwing on purpose: runs on every route including /sign-in and
// /setup, which handle the no-session case themselves. A throwing
// middleware here redirect-loops a fresh instance between the two.
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders()
    return await auth.api.getSession({ headers })
})
