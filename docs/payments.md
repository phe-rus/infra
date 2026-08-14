# Payments

Infra includes a mobile-money payments layer built on [PawaPay](https://pawapay.io): deposits, payouts, and refunds, with a receipt page generated for every transaction.

## What it does

- **Deposits** — any signed-in user can initiate a deposit (money coming in from a mobile-money account into the platform).
- **Payouts** — admin/owner only. Cashing out from the platform.
- **Refunds** — admin/owner only. Reverses a completed deposit. Refund eligibility is checked against PawaPay's own API in real time, not just Infra's locally cached transaction status, since the two can briefly disagree while a webhook is in flight.
- **Wallet balances** — admin/owner only. The platform's real PawaPay balances, with an optional live currency conversion to a single combined total.

Every payment gets a receipt page in the dashboard (printable), and completed payments trigger an emailed receipt automatically.

## Configuration

Set these in `.dev.vars` locally, or your production secret store:

```
PAWAPAY_API_TOKEN=...
PAWAPAY_ENV=sandbox   # or "production"
```

Infra starts in sandbox mode by default. Nothing about a production deployment automatically switches this — you set `PAWAPAY_ENV=production` deliberately when you're ready.

## Webhooks

PawaPay notifies Infra of a payment's outcome asynchronously via a signed webhook (`POST /pay/webhook`), verified using [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html) HTTP message signatures — every claim in the callback body is untrusted until its signature checks out against PawaPay's published public key. Point PawaPay's dashboard callback URL at your deployed instance's `/pay/webhook` endpoint (this needs a real publicly reachable URL — a local dev instance won't receive real callbacks without a tunnel).

## Rate limits

`/pay/*` endpoints (deposit, payout, refund, config, balances, webhook) each track their own request budget, independent of the platform-wide default rate limit — see [Architecture](architecture.md#rate-limiting).
