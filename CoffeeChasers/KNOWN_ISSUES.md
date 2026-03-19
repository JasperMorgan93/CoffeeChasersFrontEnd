# Known Issues

Last updated: 2026-03-19

## High

1. Session restore does not validate stored token before marking user as authenticated.
- Impact: Expired/invalid tokens from `SecureStore` can still unlock app routes until the first protected API call fails.
- Evidence: `contexts/AuthContext.tsx:30`, `contexts/AuthContext.tsx:39`, `contexts/AuthContext.tsx:118`
- Notes: `loadSession` trusts cached token/user directly and never calls `/users/auth/me`.

2. Signup flow assumes `access_token` is always present.
- Impact: If backend/Supabase signup requires email confirmation (or returns a different payload), login state can break immediately after registration.
- Evidence: `contexts/AuthContext.tsx:78`, `contexts/AuthContext.tsx:79`, `contexts/AuthContext.tsx:81`, `services/api.ts:216`
- Notes: Code immediately uses `session.access_token` without guarding for missing token.

## Medium

1. API layer always parses response as JSON, including for empty-body responses.
- Impact: Any `204 No Content` (or non-JSON success) endpoint will throw on `response.json()`.
- Evidence: `services/api.ts:178`
- Notes: This is currently latent, but likely to surface with delete/update endpoints.

2. Restored user object can be stale relative to server profile updates.
- Impact: Name/email shown in profile may drift from backend until re-login.
- Evidence: `contexts/AuthContext.tsx:37`, `contexts/AuthContext.tsx:40`
- Notes: `loadSession` restores cached `auth_user` and does not refresh via `/users/profiles/me`.

3. Review history date rendering is locale-dependent and can shift by timezone.
- Impact: Users may see different dates for the same review across devices/timezones.
- Evidence: `services/api.ts:100`
- Notes: `new Date(...).toLocaleDateString()` is non-deterministic across locales.

4. Dev bypass creates an authenticated user with ID `0`.
- Impact: Review history requests can call `/reviews/customer/0`, which may return errors or misleading empty states depending on backend behavior.
- Evidence: `contexts/AuthContext.tsx:110`, `hooks/useReviewHistory.ts:25`, `services/api.ts:255`
- Notes: This only affects development mode.

## Low

1. Raw backend/internal error details are surfaced in login failure text.
- Impact: User-facing error strings may include noisy technical details.
- Evidence: `services/api.ts:210`
- Notes: Current message embeds `(${error.message})` directly.

2. Register screen uses `router.back()` for "Sign in".
- Impact: If user lands directly on register (deep link/refresh), back navigation may not always go to login.
- Evidence: `app/(auth)/register.tsx:137`
- Notes: More deterministic navigation would be `router.replace('/(auth)/login')`.
