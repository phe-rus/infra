# Rate-limiting auth across three apps without slowing anyone down

Infra is the authentication layer every Pherus product sits behind, which means one rate-limiter mistake affects everything at once. Here's what we actually found when we went looking for gaps.

## The surprise: not everything is rate-limited

The library we build on ships two separate code paths: one for direct in-process calls, one for real HTTP requests. Rate limiting only runs on the second path. That means an admin dashboard calling into auth directly, in the same process, was never touching the rate limiter at all, no matter how the limits were configured. Only genuine browser requests through the public API were ever covered.

That's not a bug in the library, it's a boundary we didn't know we were relying on until we read the source directly instead of assuming.

## What we changed

The library also ships sensible defaults for the obvious targets, sign-in, sign-up, password resets, a few requests per short window. We added explicit limits for the paths that don't get a default: session checks, sign-out, profile updates, account deletion, scaled to how much damage a burst of each one could do. Account deletion got the tightest limit of the new set, close to sign-in's own default, on purpose.

## Why this is worth writing down

Every one of these numbers is a judgment call, not a formula. Publishing the reasoning here means the next person adjusting a limit is working from "here's why this number" instead of guessing at what a stranger meant six months ago, whether that next person is on this team or reading along.
