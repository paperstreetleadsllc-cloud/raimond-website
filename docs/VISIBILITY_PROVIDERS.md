# Observed AI visibility: provider options and cost

Status: research for Drew's approval, 2026-11-16. No provider is connected and no paid call has been made. Prices were read from public pages on this date and change often; re-check before committing spend.

## What "measuring visibility" means here

For each customer we ask each AI product a fixed set of customer questions (for example, "Who is the best plumber in Tampa, FL?"), store the raw answer and its citations, and record whether the business was mentioned, recommended or cited. The detection and storage code for this already exists and is tested (`src/lib/visibility`).

## The limit to state plainly

An API answer is not the same as what a person sees in the consumer app. The ChatGPT app, for example, applies its own instructions, location and personalisation that the API does not. Every result must therefore be labelled by how it was obtained ("ChatGPT, via API with web search"), and the product must never present it as "what ChatGPT says about you" without that qualifier.

## Provider by provider

| Product on our report | How it can be measured | Published price | Notes |
|---|---|---|---|
| ChatGPT Search | OpenAI API with the web search tool | $10 per 1,000 search calls, plus tokens | One question can trigger several searches |
| Perplexity | Perplexity Sonar API | $5 to $12 per 1,000 requests by context size, plus tokens at $1 per million | Closest match between API and consumer product |
| Claude | Claude API with the web search tool | $10 per 1,000 searches, plus tokens | |
| Grok | xAI API with web search | $5 per 1,000 calls, plus tokens | |
| Google AI Mode | DataForSEO AI Mode SERP API (a third-party scraper) | $1.20 to $4.00 per 1,000 results by speed | Captures the real consumer page. Google offers no official API |
| Google AI Overviews | Third-party SERP APIs return the overview block with organic results | Not verified | Same scraper caveat |
| Google (Gemini) | Gemini API with Google Search grounding | 5,000 free per month, then $14 per 1,000 | A proxy only: it is not AI Overviews or AI Mode, and must not be labelled as either |
| Microsoft Copilot | No official API found | Not verified | Stays "Not currently measured" until a reliable route exists |

Scraper routes carry a terms-of-service and reliability risk that the official APIs do not. That is a business decision for Drew, not a technical one.

## Estimated running cost

These are estimates from the prices above, not measured spend.

- **Assumed workload per customer:** 10 questions, run weekly, across four official APIs plus Google AI Mode. That is about 43 question-runs per provider per month.
- **Assumed cost per question:** roughly 1 to 4 cents on each official API (search fee plus tokens, allowing for multiple searches), and under half a cent for AI Mode.
- **Estimated total:** about $3 to $6 per customer per month.
- **Against plan price:** under 3% of the $199 Monitor plan.

Token costs depend on the model chosen and how much each search returns, so the first real runs will replace these estimates with measured figures. The existing design already records cost per call.

## Recommended first step

1. Start with **Perplexity and OpenAI** only. They are official APIs, cover the two products customers ask about most, and need no scraper decision.
2. Run a **pilot on three businesses**, 10 questions each, three runs. That is 180 calls.
3. **Spend requested: a hard cap of $25**, enforced in code, covering the pilot and development testing. Estimated actual use is under $10.
4. Review the measured cost and answer quality, then decide on Claude, Grok and the Google scraper route.

## What Drew needs to decide

1. Approve the $25 pilot cap, or set a different one.
2. Create the Perplexity and OpenAI API accounts and add prepaid credit. Minimum top-up amounts were not verified. Keys go into Vercel by Drew, as before.
3. Whether third-party scrapers are acceptable for Google AI Mode and AI Overviews.

## Sources

- OpenAI web search pricing: https://www.g2.com/articles/openai-api-pricing and https://community.openai.com/t/search-web-using-openai-api/1363698
- Perplexity: https://docs.perplexity.ai/getting-started/pricing and https://usagepricing.com/blueprint/activity/perplexity-ai-2026-07-21-packaging
- Claude: https://docs.claude.com/en/docs/about-claude/pricing
- xAI: https://www.g2.com/articles/xai-grok-api-cost
- Gemini grounding: https://ai.google.dev/pricing and https://cloud.google.com/vertex-ai/generative-ai/pricing
- DataForSEO AI Mode: https://dataforseo.com/pricing/serp/google-ai-mode-serp-api
