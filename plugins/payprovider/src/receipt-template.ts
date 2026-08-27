import { COLORS, layout, tableRow } from "@infra/notify"
import type { PaymentReceiptInfo } from "./endpoints/pawapay"

const TYPE_LABEL: Record<PaymentReceiptInfo["type"], string> = {
    deposit: "Mobile money deposit",
    payout: "Payout",
    refund: "Refund",
}

// modeled on Stripe/Anthropic-style payment receipts — the itemized detail
// lives directly in the email body since there's no PDF generation yet
// (an open decision, not built), rather than a "download receipt" button
// pointing at something that doesn't exist. Uses @infra/notify's
// layout/tableRow so this doesn't keep its own copy of the same HTML
// scaffolding every other transactional email in this app already uses.
export function paymentReceiptEmailHtml(appName: string, receipt: PaymentReceiptInfo): string {
    const maskedPhone = receipt.phoneNumber ? `•••• ${receipt.phoneNumber.slice(-4)}` : null
    const paymentMethod = [receipt.provider, maskedPhone].filter(Boolean).join(" · ")
    const lineLabel = TYPE_LABEL[receipt.type]
    const amount = `${receipt.amount} ${receipt.currency}`

    const cardContent = `<tr>
                    <td style="padding:28px 28px 0 28px;">
                      <p class="text" style="margin:0 0 8px 0;font-size:14px;color:${COLORS.light.text};">Hi ${receipt.userName}, here's your receipt from ${appName}.</p>
                      <p class="muted" style="margin:0 0 4px 0;font-size:13px;color:${COLORS.light.muted};">Receipt from ${appName}</p>
                      <p class="text" style="margin:0;font-size:32px;font-weight:700;color:${COLORS.light.text};">${amount}</p>
                      <p class="muted" style="margin:4px 0 0 0;font-size:13px;color:${COLORS.light.muted};">Paid ${receipt.date}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px 0 28px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${tableRow("Billed to", receipt.email)}
                        ${tableRow("Receipt number", receipt.referenceId)}
                        ${paymentMethod ? tableRow("Payment method", paymentMethod) : ""}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td class="divider" style="padding:20px 28px 0 28px;border-top:1px solid ${COLORS.light.border};margin-top:8px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                        <tr>
                          <td class="text" style="padding:4px 0;font-size:13px;color:${COLORS.light.text};">
                            ${lineLabel}<br /><span class="muted" style="font-size:12px;color:${COLORS.light.muted};">Qty 1</span>
                          </td>
                          <td class="text" align="right" style="padding:4px 0;font-size:13px;color:${COLORS.light.text};">${amount}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td class="divider" style="padding:16px 28px 24px 28px;border-top:1px solid ${COLORS.light.border};">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                        ${tableRow("Total", amount)}
                        ${tableRow("Amount paid", amount, COLORS.light.text)}
                      </table>
                    </td>
                  </tr>`

    return layout(
        appName,
        cardContent,
        "Questions about this transaction? Contact your account admin."
    )
}
