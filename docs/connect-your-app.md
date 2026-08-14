# Connect Your App

This is the practical, code-first version of [OAuth Provider](oauth-provider.md): how to actually wire a real application up to sign users in through your Infra instance. Every endpoint and value below is read straight from a running instance's own discovery document — point any OIDC-aware library at your issuer URL and it can find all of this itself:

```bash
curl https://your-infra-instance.example.com/.well-known/openid-configuration
```

```json
{
  "issuer": "https://your-infra-instance.example.com/api/auth",
  "authorization_endpoint": "https://your-infra-instance.example.com/api/auth/oauth2/authorize",
  "token_endpoint": "https://your-infra-instance.example.com/api/auth/oauth2/token",
  "userinfo_endpoint": "https://your-infra-instance.example.com/api/auth/oauth2/userinfo",
  "jwks_uri": "https://your-infra-instance.example.com/api/auth/jwks",
  "introspection_endpoint": "https://your-infra-instance.example.com/api/auth/oauth2/introspect",
  "revocation_endpoint": "https://your-infra-instance.example.com/api/auth/oauth2/revoke",
  "grant_types_supported": ["authorization_code", "client_credentials", "refresh_token"],
  "code_challenge_methods_supported": ["S256"]
}
```

Every example below assumes `ISSUER = https://your-infra-instance.example.com/api/auth` — swap in your own instance's URL.

## 1. Register a client

From **Console** in the Infra dashboard, create an OAuth client. You'll pick a redirect URI and a client type — a normal server-rendered web app or Next.js app is a **confidential client** (it has a secret, keep it server-side only); a single-page app or mobile app is a **public client** (no secret, PKCE is mandatory). Copy the client secret shown at creation — it's shown exactly once.

## 2. The flow, step by step

1. Generate a PKCE `code_verifier` and its `code_challenge` (see below), and a random `state` value.
2. Redirect the user's browser to the authorization endpoint with your `client_id`, `redirect_uri`, `scope`, `state`, and `code_challenge`.
3. The user signs in (or signs up) on Infra's own hosted page, sees a consent screen naming your app, and approves.
4. Infra redirects back to your `redirect_uri` with `?code=...&state=...`.
5. Your backend exchanges the code — plus the original `code_verifier` — at the token endpoint for `access_token`, `id_token`, and (if you requested `offline_access`) a `refresh_token`.

## 3. Example: plain fetch / curl (any language)

Generating PKCE values (Node, but the algorithm is identical everywhere — SHA-256 the verifier, base64url-encode it):

```js
import crypto from "node:crypto"

const codeVerifier = crypto.randomBytes(32).toString("base64url")
const codeChallenge = crypto
  .createHash("sha256")
  .update(codeVerifier)
  .digest("base64url")
```

Build the authorize URL and redirect the user:

```js
const params = new URLSearchParams({
  client_id: "YOUR_CLIENT_ID",
  redirect_uri: "https://yourapp.example.com/callback",
  response_type: "code",
  scope: "openid profile email offline_access",
  state: crypto.randomUUID(),
  code_challenge: codeChallenge,
  code_challenge_method: "S256",
})

// send the user here
`${ISSUER}/oauth2/authorize?${params}`
```

In your callback handler, exchange the code:

```js
const res = await fetch(`${ISSUER}/oauth2/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: request.query.code,
    redirect_uri: "https://yourapp.example.com/callback",
    client_id: "YOUR_CLIENT_ID",
    client_secret: "YOUR_CLIENT_SECRET", // confidential clients only
    code_verifier: codeVerifier,
  }),
})
const { access_token, id_token, refresh_token } = await res.json()
```

Fetch the signed-in user's identity with the access token:

```bash
curl $ISSUER/oauth2/userinfo -H "Authorization: Bearer $access_token"
```

## 4. Example: Next.js (Auth.js / NextAuth)

Infra's discovery document means [Auth.js](https://authjs.dev)'s generic OIDC provider needs almost no manual configuration:

```ts
// auth.ts
import NextAuth from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "infra",
      name: "Infra",
      type: "oidc",
      issuer: "https://your-infra-instance.example.com/api/auth",
      clientId: process.env.INFRA_CLIENT_ID,
      clientSecret: process.env.INFRA_CLIENT_SECRET,
      authorization: { params: { scope: "openid profile email offline_access" } },
    },
  ],
})
```

Auth.js discovers every endpoint (authorize, token, userinfo, jwks) from the `issuer` URL automatically and handles PKCE for you.

## 5. Example: single-page app or mobile (public client)

Public clients never hold a secret — the redirect URI and PKCE are the whole security model, so `code_challenge_method: S256` is required and there's no `client_secret` in the token exchange. In a browser, generate the PKCE pair with Web Crypto instead of Node's `crypto` module:

```js
function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

const verifierBytes = crypto.getRandomValues(new Uint8Array(32))
const codeVerifier = base64url(verifierBytes)
const codeChallenge = base64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier)))
```

Everything else — the authorize redirect and the token exchange — is the same shape as the fetch example above, just without `client_secret`.

## 6. Machine-to-machine (no user involved)

For a service-to-service call with no human in the loop, use the `client_credentials` grant directly against the token endpoint — no browser redirect at all:

```bash
curl -X POST $ISSUER/oauth2/token \
  -d grant_type=client_credentials \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

## 7. Verifying tokens yourself

If your backend needs to validate an access token without calling `/oauth2/userinfo` on every request, verify the `id_token`'s signature against Infra's published JWKS (`$ISSUER/jwks`, `EdDSA`), or call the introspection endpoint directly:

```bash
curl -X POST $ISSUER/oauth2/introspect \
  -u YOUR_CLIENT_ID:YOUR_CLIENT_SECRET \
  -d token=$access_token
```

## What connected apps can't do yet

The `payments` scope exists and is selectable when registering a client, but Infra's payments endpoints (`/pay/*`) don't yet accept OAuth Bearer tokens — only an Infra dashboard session can call them today. Treat `payments` as reserved for a future release rather than something to build against right now.
