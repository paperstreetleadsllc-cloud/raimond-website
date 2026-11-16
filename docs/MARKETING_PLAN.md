# RAimondAI early marketing plan

Status: draft for Drew's review, 2026-11-15. Nothing in this plan has been published, sent, or submitted. Every external step needs approval first.

## The honest starting point

- **raimondai.com is still the old trading page.** Our own audit scores it 27 out of 100: its HTML contains zero words until JavaScript runs, so AI crawlers see an empty page.
- **Nothing we write can earn visibility until the new site is live on the domain.** Launch is the first marketing action, not a later one.
- **The product is the marketing.** A free audit with evidence is the lead magnet, the demo, and the content source.

## Positioning

- **Who it is for:** owners of local service businesses, and the small agencies that serve them.
- **What we say:** "See what AI search can actually read on your website, with the evidence."
- **What we never say:** that we can guarantee an AI recommendation, or any visibility figure we have not measured.
- **Why that matters:** this market is filling with tools that show invented "AI visibility scores". Showing evidence and saying "not measured" is the differentiator.

## Phase 0: on-site foundation (built, on the development branch)

| Item | State |
|---|---|
| Server-rendered pages with text in the HTML | Built |
| Organization, FAQ, Article and Breadcrumb structured data | Built |
| Three question-and-answer guides under `/guides` | Built |
| Sitemap, robots.txt, `llms.txt` | Built |
| Free audit that works without an account | Built, tested on real sites |

## Phase 1: launch (needs approval)

1. Review the privacy and terms drafts.
2. Finish Supabase sign-in settings and the Stripe test walkthrough.
3. Decide where the trading waitlist page lives.
4. Merge to main and point raimondai.com at the new site.
5. Run our own audit on raimondai.com and publish the before-and-after (27 to the new score) as the first case study.

## Phase 2: get indexed (first week after launch, free)

- Verify the domain in Google Search Console and Bing Webmaster Tools; submit the sitemap. Bing matters because it feeds Microsoft Copilot.
- Create consistent company profiles: LinkedIn company page, Crunchbase, and a Google Business Profile if eligible. Same name, description, and URL everywhere.
- List the product where AI tools get discovered: Product Hunt, G2, Capterra, AlternativeTo, and relevant directories of AI tools.

## Phase 3: content engine (weekly, free)

- **One guide a week**, each answering one question a business owner asks. Next candidates: "How do I check if ChatGPT recommends my business?", "What schema does a plumber need?", "robots.txt for AI crawlers: what to allow".
- **Industry pages**, one per trade, built from real audit findings rather than templates. Start with plumbing, roofing, HVAC.
- **Original data.** After 100 or more audits, publish aggregate findings (for example, the share of sites with no business schema). Original numbers are what other sites and AI answers cite. Only publish what the data supports.

## Phase 4: outbound using the audit (needs approval and a compliance check)

- **Audit-led outreach:** run the free audit on a local business, send the owner the three top findings with a link to the full report. Requires approval per campaign, a real postal address and opt-out in every email, and a sending domain separate from the main one.
- **Agency partners:** small web and SEO agencies can resell or white-label audits. One agency brings many clients.
- **Warm network first:** businesses Drew already works with are the fastest route to the first case studies and testimonials.

## Phase 5: measure our own AI visibility

Once the observed-visibility feature is built (Phase 3 of the product plan), track RAimondAI itself on questions such as "best AEO tool for small business". Report it publicly, including when the answer is "not mentioned yet".

## What to measure

| Metric | Source |
|---|---|
| Audits run per week | `audits` table |
| Audit to email-request rate | `audit_leads` / `audits` |
| Indexed pages and search impressions | Search Console, Bing Webmaster |
| Referrals from AI products | Analytics referrers |
| Sign-ups and paid conversions | Supabase Auth, Stripe |

## Decisions needed from Drew

1. Approve a launch date, or the conditions for one.
2. Which warm-network businesses to approach for the first three case studies.
3. Whether cold outreach is in scope at all, and from which sending domain.
4. Who is the named author on guides. A real person with a bio is a stronger trust signal than a company byline.
