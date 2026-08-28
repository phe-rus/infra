# Security Policy

## Supported Versions

Infra doesn't cut versioned releases yet; every self-hosted instance deploys from the `main` branch. Security fixes land on `main` and there's no older line still receiving backports, so the only supported version is whatever `main` currently is.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for a security vulnerability.

Instead, report it privately using either of these:

1. **GitHub Security Advisories**: use the "Report a vulnerability" button under this repository's Security tab. This is the preferred channel; it keeps the report private until a fix is ready and can track the disclosure end to end.
2. **Email**: send details to **support@pherus.org**.

Include as much of the following as you can:

- A description of the vulnerability and its potential impact
- Steps to reproduce, or a proof of concept
- The affected component (`infra`, `accounts`, `www`, `plugins/assets`, `shared/ui`, or the deploy/build tooling)
- Whether it requires a specific configuration to trigger (a particular plugin enabled, a specific role, etc.)

## What to expect

- Acknowledgment of your report within a few days.
- An assessment of severity and impact, with follow-up questions if needed.
- A fix developed privately, then a coordinated disclosure once it's available. We'll credit you in the disclosure unless you'd prefer to stay anonymous.

## Scope

In scope: the `infra` auth engine, the `accounts` end-user app, `@infra/assets`, and `@infra/ui` as shipped in this repository.

Out of scope: vulnerabilities in third-party dependencies with no Infra-specific exploit path (report those upstream instead), and issues that require an attacker to already have owner/admin access to a target instance (that access is trusted by design, see [`infra/CLAUDE.md`](infra/CLAUDE.md)'s Access model).
