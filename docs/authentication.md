# Sign In, Sign Up, Passkeys & 2FA

[Connect Your App](connect-your-app.md) covers **OAuth federation**, the right approach when your app is on a different domain than Infra and shouldn't share cookies with it. This page covers the other mode: **pointing an app you own directly at Infra**, using better-auth's own client SDK, sharing a real Infra session rather than an OAuth token. This is the better fit when your app lives on a subdomain of the same root domain as your Infra instance (Infra's `crossSubDomainCookies` is built for exactly this), or when you're extending Infra's own dashboard.

Everything on this page is a real, working better-auth API: it's the same client SDK Infraccount's own hosted OAuth-provider pages are built on, just called from your own app instead.

## Setup

```bash
bun add better-auth @better-auth/passkey
```

```ts
// auth-client.ts
import { createAuthClient } from "better-auth/client"
import { twoFactorClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"

export const authClient = createAuthClient({
  baseURL: "https://your-infra-instance.example.com/api/auth",
  plugins: [passkeyClient(), twoFactorClient()],
})
```

Your app's origin needs to be in Infra's `TRUSTED_ORIGINS` env var (a comma-separated list of allowed origin suffixes) for cross-origin requests to be accepted at all.

## Sign up

```ts
const { data, error } = await authClient.signUp.email({
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "a-strong-password",
})
```

Infra requires email verification by default. `data` won't include a usable session yet. The account exists, but the user needs to click the link Infra emails them before they're actually signed in. Don't treat a successful `signUp.email` call as "the user is now logged in."

## Sign in

```ts
const { data, error } = await authClient.signIn.email({
  email: "ada@example.com",
  password: "a-strong-password",
  rememberMe: true,
})
```

On success this sets Infra's session cookie for your shared domain, exactly like signing in on Infra's own dashboard does.

## Passkeys

Registering a passkey for an already-signed-in user:

```ts
await authClient.passkey.addPasskey()
```

This triggers the browser's native WebAuthn "create a passkey" prompt, no manual challenge/response plumbing needed, the client plugin handles it.

Signing in with a previously registered passkey (no password involved):

```ts
const { data, error } = await authClient.signIn.passkey()
```

## Two-factor authentication

Enabling 2FA for a signed-in user (returns a TOTP secret/QR code to show them):

```ts
const { data } = await authClient.twoFactor.enable({ password: "a-strong-password" })
// data.totpURI -> render as a QR code for an authenticator app
```

Verifying the code during sign-in, once 2FA is enabled: `signIn.email` above will return a "second factor required" response instead of a session; follow it with:

```ts
const { data, error } = await authClient.twoFactor.verifyTotp({ code: "123456" })
```

Backup codes (generated when 2FA is enabled) work the same way as a fallback if the user loses their authenticator.

## The hosted OAuth-flow sign-in page

The **hosted** `/sign-in` page a third-party connected app's users see mid-OAuth-flow, served by Infraccount, not the admin dashboard, supports email+password and passkey, and redirects to a second-factor step automatically when the account has 2FA enabled. It's built on the exact same client SDK described on this page, just as the one app every OAuth end user actually lands on.
