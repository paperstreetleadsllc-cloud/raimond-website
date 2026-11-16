# Security

The public audit fetches addresses supplied by anonymous visitors. These are the controls in place.

## Server-side request forgery

| Threat | Control | Where |
|---|---|---|
| Internal hostnames | `localhost`, single-label names, `.local`, `.internal`, and similar suffixes rejected | `url.ts` |
| IP literals in any encoding (`2130706433`, `0x7f.1`, `[::1]`) | The URL parser canonicalizes them; every IP literal is rejected | `url.ts` |
| Private, loopback, link-local, CGNAT, multicast, reserved ranges; IPv4-mapped, NAT64, 6to4, Teredo IPv6 | Blocked | `net.ts` `isBlockedAddress` |
| Cloud metadata (`169.254.169.254`, `metadata.google.internal`) | Covered by link-local range and suffix rules | both |
| DNS rebinding | The address check runs inside the socket's own DNS lookup, so the address validated is the address connected to | `net.ts` `guardedLookup` |
| Redirects to internal targets | Redirects are followed manually (max 5); every hop is re-validated | `net.ts` `safeFetch` |
| Non-web ports | Only default ports, 80, and 443 | `url.ts` |
| Other schemes | Only `http` and `https` | `url.ts` |

## Resource limits

- 10 pages per free audit, 3 concurrent requests, 8 s per request, 40 s total.
- 1.5 MB per page, measured after decompression (guards against compression bombs).
- HTML is parsed, never executed. No scripts from audited sites run.

## Abuse controls

- 5 audits per visitor per hour; 500 per day in total. Both are counted in the database, so they hold across serverless instances.
- A recent audit of the same site is reused for 24 hours.
- Hidden honeypot field on both forms.
- Cross-origin POSTs are rejected.
- Visitor IPs are stored only as a salted hash.

## Crawler conduct

- robots.txt is fetched first and obeyed, including for individual pages. A robots.txt that returns a server error stops the audit.
- Identifies itself as `RAimondAIBot` and links to `/bot`, which explains how to block it.
- Does not log in, submit forms, or bypass access controls.

## Data access

- Supabase tables have row-level security enabled with no policies. Only server code using the service-role key can read or write.
- Audit ids are random UUIDs. Results pages are marked `noindex` and disallowed in robots.txt.
- Internal error details are logged, never returned to the browser.

## Known gaps

- No CAPTCHA or bot challenge yet.
- No error-tracking service connected; errors go to structured logs.
- No accounts yet, so no tenant isolation to test (Phase 4).
