import { describe, expect, it } from "vitest"
import { assertCanAssignRole } from "@/kit/shared/assert-can-assign-role"

describe("assertCanAssignRole", () => {
    it("allows an owner to assign any role", () => {
        expect(() => assertCanAssignRole("owner", "owner")).not.toThrow()
        expect(() => assertCanAssignRole("owner", "admin")).not.toThrow()
        expect(() => assertCanAssignRole("owner", "user")).not.toThrow()
    })

    it("allows anyone to assign the user role", () => {
        expect(() => assertCanAssignRole("admin", "user")).not.toThrow()
        expect(() => assertCanAssignRole("user", "user")).not.toThrow()
        expect(() => assertCanAssignRole("", "user")).not.toThrow()
    })

    it("blocks a non-owner from assigning admin", () => {
        expect(() => assertCanAssignRole("admin", "admin")).toThrow(
            "Only an owner can create admin or owner accounts"
        )
    })

    it("blocks a non-owner from assigning owner", () => {
        expect(() => assertCanAssignRole("admin", "owner")).toThrow(
            "Only an owner can create admin or owner accounts"
        )
        expect(() => assertCanAssignRole("user", "owner")).toThrow()
    })
})
