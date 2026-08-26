import * as z from "zod"

const purposeSchema = z
    .string()
    .min(4, "Must be at least 4 characters")
    .max(22)
    .regex(/^[a-zA-Z0-9 ]*$/, "Letters, numbers, and spaces only")
    .optional()

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

export type PaymentRow = {
    id: string
    userId: string
    clientId: string | null
    type: string
    rail: string
    provider: string | null
    phoneNumber: string | null
    amount: string
    currency: string
    pawapayReferenceId: string | null
    dodoReferenceId: string | null
    status: string
    failureReason: string | null
    metadata: string | null
    createdAt: Date
    updatedAt: Date
}

export type UserStub = {
    id: string
    name: string
    email: string
}

export const PAYMENT_SELECT = [
    "id",
    "userId",
    "clientId",
    "type",
    "rail",
    "provider",
    "phoneNumber",
    "amount",
    "currency",
    "pawapayReferenceId",
    "dodoReferenceId",
    "status",
    "failureReason",
    "metadata",
    "createdAt",
    "updatedAt",
] as const
