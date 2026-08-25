import { describe, expect, it } from "vitest"
import { FIXED_ROLE_NAMES, isAdminTier, isOwner } from "@/auth/utils/permissions"

describe("isAdminTier", () => {
    it("treats owner as admin tier", () => {
        expect(isAdminTier("owner")).toBe(true)
    })

    it("treats admin as admin tier", () => {
        expect(isAdminTier("admin")).toBe(true)
    })

    it("does not treat a plain user as admin tier", () => {
        expect(isAdminTier("user")).toBe(false)
    })

    it("does not treat an empty or unknown role as admin tier", () => {
        expect(isAdminTier("")).toBe(false)
        expect(isAdminTier("superadmin")).toBe(false)
    })
})

describe("isOwner", () => {
    it("is true only for owner", () => {
        expect(isOwner("owner")).toBe(true)
        expect(isOwner("admin")).toBe(false)
        expect(isOwner("user")).toBe(false)
        expect(isOwner("")).toBe(false)
    })
})

describe("FIXED_ROLE_NAMES", () => {
    it("is exactly the three fixed roles, in the order the access model documents", () => {
        expect(FIXED_ROLE_NAMES).toEqual(["owner", "admin", "user"])
    })
})
