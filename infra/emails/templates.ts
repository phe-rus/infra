// table-based layout + a mix of inline styles (the safe default every
// client honors) and a <style> block with @media (prefers-color-scheme)
// overrides (honored by Apple Mail, iOS/Gmail apps, Outlook.com — ignored
// harmlessly everywhere else, which just keeps the light look). Colors are
// hex conversions of this app's own OKLCH theme tokens (globals.css), not
// picked freestyle, so the email actually matches the app's real palette.

export const COLORS = {
    light: {
        bg: "#f4f4f0",
        card: "#ffffff",
        border: "#e8e8e3",
        text: "#0c0c09",
        muted: "#7c7c67",
        buttonBg: "#1d1d16",
        buttonText: "#ffffff",
    },
    dark: {
        bg: "#0c0c09",
        card: "#1d1d16",
        border: "#33332a",
        text: "#fbfbf9",
        muted: "#abab9c",
        buttonBg: "#e8e8e3",
        buttonText: "#0c0c09",
    },
}

const COLOR_SCHEME_HEAD = `<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />`

function colorStyleBlock(): string {
    return `<style>
      body, .bg { background-color: ${COLORS.light.bg}; }
      .card { background-color: ${COLORS.light.card}; border-color: ${COLORS.light.border} !important; }
      .text { color: ${COLORS.light.text} !important; }
      .muted { color: ${COLORS.light.muted} !important; }
      .divider { border-color: ${COLORS.light.border} !important; }
      .button { background-color: ${COLORS.light.buttonBg} !important; color: ${COLORS.light.buttonText} !important; }
      @media (prefers-color-scheme: dark) {
        body, .bg { background-color: ${COLORS.dark.bg} !important; }
        .card { background-color: ${COLORS.dark.card} !important; border-color: ${COLORS.dark.border} !important; }
        .text { color: ${COLORS.dark.text} !important; }
        .muted { color: ${COLORS.dark.muted} !important; }
        .divider { border-color: ${COLORS.dark.border} !important; }
        .button { background-color: ${COLORS.dark.buttonBg} !important; color: ${COLORS.dark.buttonText} !important; }
      }
    </style>`
}

function layout(appName: string, cardContent: string, footerText: string): string {
    return `<!doctype html>
<html>
  <head>
    ${COLOR_SCHEME_HEAD}
    ${colorStyleBlock()}
  </head>
  <body class="bg" style="margin:0;padding:0;background-color:${COLORS.light.bg};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background-color:${COLORS.light.bg};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
            <tr>
              <td style="padding-bottom:20px;">
                <span class="text" style="font-size:15px;font-weight:700;letter-spacing:-0.01em;color:${COLORS.light.text};">${appName}</span>
              </td>
            </tr>
            <tr>
              <td class="card divider" style="background-color:${COLORS.light.card};border:1px solid ${COLORS.light.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${cardContent}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 4px 0 4px;">
                <p class="muted" style="margin:0;font-size:12px;line-height:1.6;color:${COLORS.light.muted};">${footerText}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function baseTemplate(
    appName: string,
    heading: string,
    body: string,
    ctaLabel: string,
    ctaUrl: string
): string {
    const cardContent = `<tr>
                    <td style="padding:28px 28px 0 28px;">
                      <h1 class="text" style="margin:0;font-size:18px;line-height:1.4;color:${COLORS.light.text};font-weight:600;">${heading}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 28px 0 28px;">
                      <p class="muted" style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.light.muted};">${body}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px 0 28px;">
                      <a href="${ctaUrl}" class="button" style="display:inline-block;background-color:${COLORS.light.buttonBg};color:${COLORS.light.buttonText};font-size:13px;font-weight:600;text-decoration:none;padding:8px 16px;">${ctaLabel}</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="divider" style="padding:20px 28px 20px 28px;border-top:1px solid ${COLORS.light.border};margin-top:20px;">
                      <p class="muted" style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:${COLORS.light.muted};">
                        If the button doesn't work, copy and paste this link into your browser:<br />
                        <span style="word-break:break-all;">${ctaUrl}</span>
                      </p>
                    </td>
                  </tr>`

    return layout(
        appName,
        cardContent,
        "If you didn't request this, you can safely ignore this email."
    )
}

export function verificationEmailHtml(appName: string, name: string, url: string): string {
    return baseTemplate(
        appName,
        "Verify your email",
        `Hi ${name}, confirm your email address to finish setting up your ${appName} account.`,
        "Verify email",
        url
    )
}

export function resetPasswordEmailHtml(appName: string, name: string, url: string): string {
    return baseTemplate(
        appName,
        "Reset your password",
        `Hi ${name}, we received a request to reset your ${appName} password. This link expires in 1 hour.`,
        "Reset password",
        url
    )
}

export function deleteAccountEmailHtml(appName: string, name: string, url: string): string {
    return baseTemplate(
        appName,
        "Confirm account deletion",
        `Hi ${name}, confirm you want to permanently delete your ${appName} account. This can't be undone.`,
        "Delete my account",
        url
    )
}

export type PaymentReceiptData = {
    userName: string
    email: string
    type: "deposit" | "payout" | "refund"
    amount: string
    currency: string
    provider: string | null
    phoneNumber: string | null
    referenceId: string
    date: string
}

function receiptRow(label: string, value: string, valueColor = COLORS.light.text): string {
    return `<tr>
      <td class="muted" style="padding:6px 0;font-size:13px;color:${COLORS.light.muted};">${label}</td>
      <td class="text" align="right" style="padding:6px 0;font-size:13px;color:${valueColor};">${value}</td>
    </tr>`
}

const TYPE_LABEL: Record<PaymentReceiptData["type"], string> = {
    deposit: "Mobile money deposit",
    payout: "Payout",
    refund: "Refund",
}

// modeled on Stripe/Anthropic-style payment receipts — the itemized detail
// lives directly in the email body since there's no PDF generation yet
// (an open decision, not built), rather than a "download receipt" button
// pointing at something that doesn't exist
export function paymentReceiptEmailHtml(appName: string, receipt: PaymentReceiptData): string {
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
                        ${receiptRow("Billed to", receipt.email)}
                        ${receiptRow("Receipt number", receipt.referenceId)}
                        ${paymentMethod ? receiptRow("Payment method", paymentMethod) : ""}
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
                        ${receiptRow("Total", amount)}
                        ${receiptRow("Amount paid", amount, COLORS.light.text)}
                      </table>
                    </td>
                  </tr>`

    return layout(
        appName,
        cardContent,
        "Questions about this transaction? Contact your account admin."
    )
}
