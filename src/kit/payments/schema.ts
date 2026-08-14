import * as z from "zod"

// PawaPay's own customerMessage constraint (confirmed live: rejects "-" and
// anything under 4 chars) — alphanumeric and spaces only, 4-22 chars
const purposeSchema = z
    .string()
    .min(4, "Must be at least 4 characters")
    .max(22)
    .regex(/^[a-zA-Z0-9 ]*$/, "Letters, numbers, and spaces only")
    .optional()

export const depositSchema = z.object({
    amount: z.string().min(1),
    currency: z.string().length(3),
    phoneNumber: z.string().min(1),
    provider: z.string().min(1),
    purpose: purposeSchema,
    clientId: z.string().optional(),
})

export const payoutSchema = z.object({
    amount: z.string().min(1),
    currency: z.string().length(3),
    phoneNumber: z.string().min(1),
    provider: z.string().min(1),
    purpose: purposeSchema,
})

export const listPaymentsSchema = z.object({
    userId: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
})

export const walletBalancesSchema = z.object({
    currency: z.string().length(3).optional(),
})

export const refundSchema = z.object({
    paymentId: z.string().min(1),
    amount: z.string().min(1).optional(),
    purpose: purposeSchema,
})
