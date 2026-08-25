import { describe, expect, it } from "vitest"
import { FIXED_ROLE_NAMES, isAdminTier } from "../src/core/permissions"

describe("isAdminTier", () => {
    it("treats admin as admin tier", () => {
        expect(isAdminTier("admin")).toBe(true)
    })

    it("does not treat a plain user as admin tier", () => {
        expect(isAdminTier("user")).toBe(false)
    })

    it("does not treat an empty or unknown role as admin tier", () => {
        expect(isAdminTier("")).toBe(false)
        expect(isAdminTier("superadmin")).toBe(false)
        expect(isAdminTier("owner")).toBe(false)
    })
})

describe("FIXED_ROLE_NAMES", () => {
    it("is exactly the two fixed roles, in the order the access model documents", () => {
        expect(FIXED_ROLE_NAMES).toEqual(["admin", "user"])
    })
})
