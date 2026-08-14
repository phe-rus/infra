# OAuth Provider

Infra can act as a full OAuth 2.1 / OIDC identity provider for any application you build, not just its own dashboard. This is powered by `@better-auth/oauth-provider`, a spec-compliant implementation, managed from the **Console** page in the admin dashboard.

## Registering an application

From **Console** in the dashboard, an admin or owner can create a new OAuth client. You'll need:

- **A redirect URI** — where Infra sends the user back after they approve access. Required at creation.
- **A client type** — presented as familiar categories in the UI (back-end web app, machine-to-machine, front-end/mobile, device/IoT), mapped underneath to the real OAuth client shape (confidential vs. public, which grant types are allowed, whether PKCE is required).
- **Scopes** — which pieces of the user's identity (and which platform capabilities) the application can request. See below.

Creating a client shows you its **client secret exactly once** — copy it immediately, it isn't retrievable again. If it's lost, rotate the secret from the client's detail page instead of trying to recover the old one.

## Available scopes

| Scope | Grants |
|---|---|
| `openid` | Base OIDC — required for ID tokens |
| `profile` | Name, avatar, and other profile fields |
| `email` | Email address and verification status |
| `offline_access` | A refresh token, so the application can stay signed in without the user re-authorizing |
| `payments` | Access to Infra's payments endpoints on the user's behalf |

## The authorization flow

Standard OAuth 2.1 authorization-code flow with PKCE:

1. Your application redirects the user to Infra's `/oauth2/authorize` endpoint with your `client_id`, `redirect_uri`, requested `scope`, and a PKCE `code_challenge`.
2. If the user isn't signed in to Infra yet, they see Infra's own hosted login page (and sign-up page, if your application allows self-service accounts) first.
3. The user sees a consent screen naming your application and the scopes it's requesting, and approves or denies.
4. Infra redirects back to your `redirect_uri` with an authorization `code`.
5. Your backend exchanges that code (plus the PKCE `code_verifier`) at Infra's token endpoint for an access token, refresh token (if `offline_access` was granted), and ID token.
6. Verify the ID token against Infra's published JWKS, or call `/oauth2/userinfo` with the access token to fetch the user's identity directly.

Discovery documents are published at the standard well-known paths, so most OAuth/OIDC client libraries can be pointed at your Infra instance's base URL and configured automatically rather than needing every endpoint hardcoded by hand.

## Self-service sign-up

If your application needs to let brand-new users create an account (rather than only signing in with an existing one), Infra hosts a sign-up page as part of the same flow. Accounts created this way get the plain `user` role — they can complete your application's OAuth flow, but they never gain access to the Infra admin dashboard itself, regardless of how they signed up.
