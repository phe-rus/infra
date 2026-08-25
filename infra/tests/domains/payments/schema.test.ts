import { describe, expect, it } from "vitest"
import { payoutSchema, refundSchema, walletBalancesSchema } from "@/domains/payments/schema"

const validPayout = {
    amount: "5000",
    currency: "UGX",
    phoneNumber: "256771234567",
    provider: "MTN_MOMO_UGA",
}

describe("payoutSchema", () => {
    it("accepts a valid payout", () => {
        const result = payoutSchema.safeParse(validPayout)
        expect(result.success).toBe(true)
    })

    it("rejects a currency that isn't exactly 3 characters", () => {
        expect(payoutSchema.safeParse({ ...validPayout, currency: "UG" }).success).toBe(false)
        expect(payoutSchema.safeParse({ ...validPayout, currency: "UGXX" }).success).toBe(false)
    })

    it("rejects an empty amount, phoneNumber, or provider", () => {
        expect(payoutSchema.safeParse({ ...validPayout, amount: "" }).success).toBe(false)
        expect(payoutSchema.safeParse({ ...validPayout, phoneNumber: "" }).success).toBe(false)
        expect(payoutSchema.safeParse({ ...validPayout, provider: "" }).success).toBe(false)
    })

    describe("purpose constraint", () => {
        it("accepts a valid purpose", () => {
            const result = payoutSchema.safeParse({ ...validPayout, purpose: "Wallet top up" })
            expect(result.success).toBe(true)
        })

        it("accepts no purpose at all, since it's optional", () => {
            const result = payoutSchema.safeParse(validPayout)
            expect(result.success).toBe(true)
        })

        // PawaPay's real API rejected both of these live: a hyphen and a
        // too-short string, this constraint exists specifically because of that
        it("rejects a purpose under 4 characters", () => {
            const result = payoutSchema.safeParse({ ...validPayout, purpose: "abc" })
            expect(result.success).toBe(false)
        })

        it("rejects a purpose over 22 characters", () => {
            const result = payoutSchema.safeParse({
                ...validPayout,
                purpose: "a".repeat(23),
            })
            expect(result.success).toBe(false)
        })

        it("accepts exactly 22 characters", () => {
            const result = payoutSchema.safeParse({
                ...validPayout,
                purpose: "a".repeat(22),
            })
            expect(result.success).toBe(true)
        })

        it("rejects a purpose containing a hyphen", () => {
            const result = payoutSchema.safeParse({ ...validPayout, purpose: "wallet-topup" })
            expect(result.success).toBe(false)
        })

        it("rejects punctuation in general, only letters, numbers, and spaces are allowed", () => {
            for (const purpose of ["hello!", "50% off", "a/b test", "line\nbreak"]) {
                expect(payoutSchema.safeParse({ ...validPayout, purpose }).success).toBe(false)
            }
        })
    })
})

describe("refundSchema", () => {
    it("requires a paymentId and nothing else", () => {
        expect(refundSchema.safeParse({ paymentId: "abc123" }).success).toBe(true)
    })

    it("rejects an empty paymentId", () => {
        expect(refundSchema.safeParse({ paymentId: "" }).success).toBe(false)
    })

    it("applies the same purpose constraint", () => {
        expect(refundSchema.safeParse({ paymentId: "abc123", purpose: "not valid!" }).success).toBe(
            false
        )
    })
})

describe("walletBalancesSchema", () => {
    it("accepts a 3-letter currency or nothing at all", () => {
        expect(walletBalancesSchema.safeParse({}).success).toBe(true)
        expect(walletBalancesSchema.safeParse({ currency: "USD" }).success).toBe(true)
        expect(walletBalancesSchema.safeParse({ currency: "US" }).success).toBe(false)
    })
})
