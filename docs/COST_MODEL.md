# Cost model

## Free audit (Phase 2)

| Item | Cost |
|---|---|
| Paid API calls | $0.00. The engine is deterministic code |
| Compute | One serverless invocation of up to 60 s, plus about 15 small database writes |
| Bandwidth | At most 10 pages of 1.5 MB, typically well under 2 MB in total |

Hard caps: 10 pages per audit, 5 audits per visitor per hour, 500 audits per day, 24-hour reuse per site. The daily cap bounds worst-case compute regardless of traffic.

Measured processing time and bytes are recorded in every audit (`result.stats`) and logged as `audit_completed`. Real figures from live sites are still to be collected.

## When costs begin

Phase 3 (provider observations) and Phase 6 (LLM-written analysis) introduce per-call costs. Before either ships: per-audit and per-customer budgets, usage records, and a monthly cap, all enforced in code. No paid API is called anywhere today.
