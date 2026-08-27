import { and, desc, eq, inArray } from "drizzle-orm"
import * as z from "zod"
import { db } from "../db"
import { payment, user } from "../schemas/auth"
import defineHandler from "../utils/defineHandler"
import { protectedSession, adminSession } from "../middleware/permissions"

type PaymentRow = typeof payment.$inferSelect
type UserStub = { id: string; name: string; email: string }

function toPayment(row: PaymentRow, u?: Pick<UserStub, "name" | "email">) {
    return {
        id: row.id,
        userId: row.userId,
        userName: u?.name ?? null,
        userEmail: u?.email ?? null,
        clientId: row.clientId,
        type: row.type,
        rail: row.rail,
        provider: row.provider,
        phoneNumber: row.phoneNumber,
        amount: row.amount,
        currency: row.currency,
        referenceId: row.pawapayReferenceId,
        status: row.status,
        failureReason: row.failureReason,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }
}

function parseOriginalPaymentId(metadata: string | null): string | null {
    if (!metadata) return null
    try {
        const parsed = JSON.parse(metadata) as { originalPaymentId?: string }
        return parsed.originalPaymentId ?? null
    } catch {
        return null
    }
}

export const paymentsRoute = defineHandler()
    .get("/list", protectedSession, adminSession, async (c) => {
        const query = z
            .object({
                userId: z.string().optional(),
                type: z.string().optional(),
                status: z.string().optional(),
            })
            .parse({
                userId: c.req.query("userId") || undefined,
                type: c.req.query("type") || undefined,
                status: c.req.query("status") || undefined,
            })

        const conditions = [
            ...(query.userId ? [eq(payment.userId, query.userId)] : []),
            ...(query.type ? [eq(payment.type, query.type)] : []),
            ...(query.status ? [eq(payment.status, query.status)] : []),
        ]

        const rows = await db
            .select()
            .from(payment)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(payment.createdAt))

        const userIds = [...new Set(rows.map((row) => row.userId))]
        const users = userIds.length
            ? await db
                  .select({ id: user.id, name: user.name, email: user.email })
                  .from(user)
                  .where(inArray(user.id, userIds))
            : []
        const userById = new Map(users.map((u) => [u.id, u]))

        return c.json({
            payments: rows.map((row) =>
                toPayment(row, userById.get(row.userId))
            ),
        })
    })
    .get("/:paymentId", protectedSession, adminSession, async (c) => {
        const paymentId = c.req.param("paymentId")
        const [row] = await db
            .select()
            .from(payment)
            .where(eq(payment.id, paymentId))
        if (!row) return c.json(null)

        const [u] = await db
            .select({ id: user.id, name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, row.userId))
        const paymentDetail = toPayment(row, u)

        let relatedDeposit: ReturnType<typeof toPayment> | null = null
        const originalPaymentId = parseOriginalPaymentId(row.metadata)
        if (row.type === "refund" && originalPaymentId) {
            const [depositRow] = await db
                .select()
                .from(payment)
                .where(eq(payment.id, originalPaymentId))
            if (depositRow) relatedDeposit = toPayment(depositRow)
        }

        let refunds: ReturnType<typeof toPayment>[] = []
        if (row.type === "deposit") {
            const refundStubs = await db
                .select({ id: payment.id, metadata: payment.metadata })
                .from(payment)
                .where(eq(payment.type, "refund"))
            const matchingIds = refundStubs
                .filter(
                    (r) => parseOriginalPaymentId(r.metadata) === row.id
                )
                .map((r) => r.id)
            const refundRows = matchingIds.length
                ? await db
                      .select()
                      .from(payment)
                      .where(inArray(payment.id, matchingIds))
                : []
            refunds = refundRows.map((r) => toPayment(r))
        }

        return c.json({
            payment: paymentDetail,
            relatedDeposit,
            refunds,
        })
    })
