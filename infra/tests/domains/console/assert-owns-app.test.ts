import { describe, expect, it } from "vitest"
import { APIError } from "better-auth/api"
import { assertOwnsApp } from "@/domains/console/assert-owns-app"

describe("assertOwnsApp", () => {
    it("allows the creating admin to act on their own client", () => {
        expect(() => assertOwnsApp("admin-1", "admin-1", "remove it")).not.toThrow()
    })

    it("blocks a different admin from acting on someone else's client", () => {
        expect(() => assertOwnsApp("admin-1", "admin-2", "remove it")).toThrow(APIError)
    })

    it("allows any admin to act on a client with no recorded owner", () => {
        expect(() => assertOwnsApp(null, "admin-2", "remove it")).not.toThrow()
    })
})
