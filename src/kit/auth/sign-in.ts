import { createServerFn } from "@tanstack/react-start"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { signInSchema } from "@/kit/schemas"

export const signIn = createServerFn({ method: "POST" })
    .validator(signInSchema)
    .handler(async ({ data }) => {
        try {
            const { headers } = await auth.api.signInEmail({
                body: data,
                returnHeaders: true,
            })
            forwardAuthHeaders(headers)
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })
