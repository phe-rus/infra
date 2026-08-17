# Payments

Infra includes a mobile-money payments layer built on [PawaPay](https://pawapay.io): deposits, payouts, and refunds, with a receipt page generated for every transaction.

## What it does

- **Deposits** — any signed-in user can initiate a deposit (money coming in from a mobile-money account into the platform).
- **Payouts** — admin/owner only. Cashing out from the platform.
- **Refunds** — admin/owner only. Reverses a completed deposit. Refund eligibility is checked against PawaPay's own API in real time, not just Infra's locally cached transaction status, since the two can briefly disagree while a webhook is in flight.
- **Wallet balances** — admin/owner only. The platform's real PawaPay balances, with an optional live currency conversion to a single combined total.

Every payment gets a receipt page in the dashboard (printable), and completed payments trigger an emailed receipt automatically.

## Calling the API directly

As in [Connect Your App](connect-your-app.md), `$ISSUER` below means `https://your-infra-instance.example.com/api/auth`.

These endpoints work with a real Infra session cookie — either Infra's own dashboard, or your own app in [direct-client mode](authentication.md) sharing a session with Infra. **They do not yet accept an OAuth access token** from a connected app (see the caveat at the bottom of [Connect Your App](connect-your-app.md)) — that's the one case these examples don't cover.

### Initiate a deposit

Any signed-in user. `purpose` (PawaPay calls this `customerMessage`) is optional but constrained: 4–22 characters, letters/numbers/spaces only.

```bash
curl -X POST $ISSUER/pay/deposit \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{
    "amount": "5000",
    "currency": "UGX",
    "phoneNumber": "256771234567",
    "provider": "MTN_MOMO_UGA",
    "purpose": "Wallet top up"
  }'
```

```json
{ "depositId": "b3f1c9de-...", "status": "pending" }
```

`status` is `pending` or `failed` immediately — PawaPay only *accepted* the request for processing at this point. The real outcome (`completed`/`failed`) arrives later via the webhook, and triggers the emailed receipt.

### Initiate a payout

Admin/owner only — this is the platform cashing out to its own operator account, not a user-facing action.

```bash
curl -X POST $ISSUER/pay/payout \
  -H "Content-Type: application/json" \
  -b "your-admin-session-cookie" \
  -d '{
    "amount": "20000",
    "currency": "UGX",
    "phoneNumber": "256771234567",
    "provider": "MTN_MOMO_UGA",
    "purpose": "Weekly payout"
  }'
```

```json
{ "payoutId": "9a7e5b21-...", "status": "pending" }
```

### Refund a deposit

Admin/owner only. `paymentId` is Infra's own payment record id (not PawaPay's `depositId`) — find it on the Billing page or via `GET /pay/config`. `amount` is optional and defaults to a full refund.

```bash
curl -X POST $ISSUER/pay/refund \
  -H "Content-Type: application/json" \
  -b "your-admin-session-cookie" \
  -d '{
    "paymentId": "3d2f...",
    "amount": "5000",
    "purpose": "Customer requested"
  }'
```

```json
{ "refundId": "1c4a8f02-...", "status": "pending" }
```

Refund eligibility is checked against PawaPay's own API in real time, not Infra's locally cached status — if the deposit isn't actually refundable, this fails with a `failureReason` rather than a generic error.

## Configuration

Set these in `infra/.env.local` locally, or your production secret store:

```
PAWAPAY_API_TOKEN=...
PAWAPAY_ENV=sandbox   # or "production"
```

Infra starts in sandbox mode by default. Nothing about a production deployment automatically switches this — you set `PAWAPAY_ENV=production` deliberately when you're ready.

## Webhooks

PawaPay notifies Infra of a payment's outcome asynchronously via a signed webhook (`POST /pay/webhook`), verified using [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html) HTTP message signatures — every claim in the callback body is untrusted until its signature checks out against PawaPay's published public key. Point PawaPay's dashboard callback URL at your deployed instance's `/pay/webhook` endpoint (this needs a real publicly reachable URL — a local dev instance won't receive real callbacks without a tunnel).

## Rate limits

`/pay/*` endpoints (deposit, payout, refund, config, balances, webhook) each track their own request budget, independent of the platform-wide default rate limit — see [Architecture](architecture.md#rate-limiting).
