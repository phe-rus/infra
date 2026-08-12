import { createServerFn } from "@tanstack/react-start"
import { APIError } from "better-auth/api"
import { auth } from "@/auth"
import { forwardAuthHeaders } from "@/auth/forward-headers"
import { completeSetupSchema } from "@/kit/schemas"

export const completeSetup = createServerFn({ method: "POST" })
    .validator(completeSetupSchema)
    .handler(async ({ data }) => {
        try {
            const { headers } = await auth.api.signUpEmail({
                body: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe,
                },
                returnHeaders: true,
            })
            forwardAuthHeaders(headers)
            return { error: null }
        } catch (error) {
            if (error instanceof APIError) return { error: error.message }
            throw error
        }
    })
