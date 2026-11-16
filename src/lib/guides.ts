/**
 * Guides are written as questions with direct answers, because that is the
 * structure the audit itself recommends. Keep every claim checkable: no
 * statistics without a source, and no promises about rankings or leads.
 */
export interface GuideSection {
  /** Phrased as the question a business owner would ask. */
  question: string;
  /** The first paragraph must answer the question directly. */
  answer: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string; // ISO date
  intro: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    slug: "what-is-answer-engine-optimization",
    title: "What is answer engine optimization (AEO)?",
    description:
      "A plain-English explanation of answer engine optimization for local businesses: what it is, how it differs from SEO, and what you can do about it.",
    updated: "2026-11-15",
    intro:
      "Answer engine optimization (AEO) is the work of making a business easy for AI assistants to find, understand, and recommend. This guide explains it without jargon.",
    sections: [
      {
        question: "What is answer engine optimization?",
        answer: [
          "Answer engine optimization is the practice of making your website and business information clear enough that AI products such as ChatGPT, Google's AI Overviews, Perplexity, and Microsoft Copilot can read it, trust it, and use it when they answer a customer's question.",
          "A search engine returns a list of links. An answer engine writes a reply, and sometimes names one or more businesses in it. AEO is about being a business that reply can accurately draw on.",
        ],
      },
      {
        question: "How is AEO different from SEO?",
        answer: [
          "SEO aims to rank a page in a list of results. AEO aims to have your business understood well enough to be mentioned, cited, or recommended inside a written answer. Most of the groundwork is shared, but the emphasis differs.",
        ],
        list: [
          "SEO rewards a page that matches a search phrase. AEO rewards content that answers a question directly.",
          "SEO success is a position on a page. AEO success is being named or cited in an answer, which has to be observed by asking the question.",
          "Both depend on a site that loads, can be crawled, and describes the business consistently.",
        ],
      },
      {
        question: "Does good SEO mean I am already visible in AI search?",
        answer: [
          "Not necessarily. A site can rank well and still be hard for AI systems to use. Common reasons are content that only appears after JavaScript runs, no structured data describing the business, and pages that never state plainly what the business does and where.",
        ],
      },
      {
        question: "What makes a website easy for AI systems to use?",
        answer: [
          "Six things account for most of it. They are the same six areas the RAimondAI readiness audit scores.",
        ],
        list: [
          "Technical access: the site loads over HTTPS, responds quickly, and does not block AI search crawlers in robots.txt.",
          "Structured data: schema markup states the business name, type, address, phone, hours, and service area.",
          "Content: each main service has its own page with real detail.",
          "Identity: the name, address, and phone number are the same everywhere.",
          "Trust: reviews, licences, years in business, and links to real profiles are visible.",
          "Structure: pages use clear headings and answer common customer questions directly.",
        ],
      },
      {
        question: "Can anyone guarantee that AI will recommend my business?",
        answer: [
          "No. Nobody controls what an AI product says, and anyone who guarantees a recommendation is overselling. What you can control is whether your site is readable, accurate, and complete. Whether AI products actually mention you can only be known by asking them real customer questions and recording the answers.",
        ],
      },
      {
        question: "Where should a small business start?",
        answer: [
          "Start by measuring. Run a readiness audit to see what an AI crawler can actually read on your site, fix the highest-impact gaps first, then check again. The RAimondAI audit is free and shows the evidence behind every point of the score.",
        ],
      },
    ],
  },
  {
    slug: "ai-search-readiness-checklist",
    title: "AI search readiness checklist for local businesses",
    description:
      "A practical checklist a local business can work through to make its website readable and trustworthy for AI search products.",
    updated: "2026-11-15",
    intro:
      "Use this checklist to find the gaps that most often stop AI products from understanding a local business website. Each item can be checked without special tools.",
    sections: [
      {
        question: "Can AI crawlers reach and read my site?",
        answer: ["They can if the site is secure, responsive, not blocked, and has its text in the page HTML. Check each of these."],
        list: [
          "The site loads over HTTPS.",
          "robots.txt exists and does not block OAI-SearchBot, PerplexityBot, Claude-SearchBot, Googlebot, or Bingbot.",
          "An XML sitemap exists and is listed in robots.txt.",
          "The main text is visible when you choose View Source in a browser, not only after scripts run.",
          "Important pages are not marked noindex.",
        ],
      },
      {
        question: "Does my site tell machines who I am?",
        answer: ["It does when structured data and visible text agree on the basics. Structured data is a short block of code that states facts about the business in a standard format."],
        list: [
          "LocalBusiness schema (or a more specific type such as Plumber or Dentist) is present on the homepage.",
          "It includes name, address, phone, website, opening hours, and area served.",
          "The name, address, and phone match what is shown on the page and on your Google Business Profile.",
        ],
      },
      {
        question: "Does my content answer what customers ask?",
        answer: ["It does when each service has its own page and common questions are answered in plain sentences."],
        list: [
          "Each main service has a dedicated page, not just a line in a list.",
          "Page titles say what the page is about and where you work.",
          "Each page has one main heading.",
          "Common questions appear as headings, each followed by a direct answer.",
          "Pages have enough detail to be useful: what is included, how long it takes, and what affects the price.",
        ],
      },
      {
        question: "Does my site give reasons to trust the business?",
        answer: ["It does when a reader can verify that the business is real, established, and well reviewed."],
        list: [
          "Real customer reviews are shown on the site.",
          "Licences, insurance, and certifications are stated.",
          "The site says how long the business has operated.",
          "There are links to your Google Business Profile and other real profiles.",
          "A privacy policy is linked.",
        ],
      },
      {
        question: "How do I check all of this quickly?",
        answer: [
          "Run the free RAimondAI audit. It reads up to ten public pages, checks every item above, and shows the evidence it found for each one, so you can see exactly what to fix.",
        ],
      },
    ],
  },
  {
    slug: "how-ai-crawlers-read-your-website",
    title: "How AI crawlers read your website",
    description:
      "What AI crawlers are, which ones matter for search, how robots.txt controls them, and why JavaScript-only content is often invisible to them.",
    updated: "2026-11-15",
    intro:
      "AI products learn about your business by sending automated programs, called crawlers, to read your pages. This guide explains which crawlers exist and what they can and cannot see.",
    sections: [
      {
        question: "What is an AI crawler?",
        answer: [
          "An AI crawler is an automated program that requests web pages on behalf of an AI product. Some crawlers build a search index, some fetch a page at the moment a user asks about it, and some collect text for model training. Each identifies itself with a name called a user agent.",
        ],
      },
      {
        question: "Which AI crawlers matter for being found?",
        answer: ["The crawlers that feed search and live answers matter most for visibility. These are the ones the RAimondAI audit checks."],
        list: [
          "OAI-SearchBot: builds the index behind ChatGPT search results.",
          "ChatGPT-User: fetches a page when a ChatGPT user asks about it.",
          "PerplexityBot: builds Perplexity's search index.",
          "Claude-SearchBot: supports search results in Claude.",
          "Googlebot: feeds Google Search, AI Overviews, and AI Mode.",
          "Bingbot: feeds Bing and Microsoft Copilot.",
        ],
      },
      {
        question: "Is blocking training crawlers the same as blocking search crawlers?",
        answer: [
          "No. Training crawlers such as GPTBot and ClaudeBot, and the Google-Extended control, relate to model training. Search crawlers relate to being found and cited. You can allow one group and block the other in robots.txt. Blocking a search crawler by mistake is a common reason a site cannot appear in that product's answers.",
        ],
      },
      {
        question: "How does robots.txt control AI crawlers?",
        answer: [
          "robots.txt is a text file at the root of your site that tells each crawler which paths it may request. Rules are grouped by user agent. A crawler follows the group that names it, and falls back to the general group marked with an asterisk if none does. Well-behaved crawlers follow these rules, although the file is a request, not a technical barrier.",
        ],
      },
      {
        question: "Why can't AI crawlers see my content if it loads with JavaScript?",
        answer: [
          "Most AI crawlers read the HTML your server sends and do not run JavaScript. If your text is added to the page by a script after it loads, those crawlers receive an almost empty page. You can check by choosing View Source in your browser: if your main text is not there, many AI crawlers cannot see it either.",
          "The fix is to render the content on the server so it is present in the initial HTML.",
        ],
      },
      {
        question: "How can I see what a crawler sees on my site?",
        answer: [
          "The RAimondAI audit requests your pages the way a crawler does, without running scripts, and reports how many words it actually received, which crawlers your robots.txt allows, and which pages it could read.",
        ],
      },
    ],
  },
  {
    slug: "how-to-check-if-chatgpt-recommends-your-business",
    title: "How do I check if ChatGPT recommends my business?",
    description:
      "A step-by-step way for a local business owner to check whether ChatGPT mentions, recommends, or cites their business, and how to read the results honestly.",
    updated: "2026-11-16",
    intro:
      "The only way to know whether ChatGPT recommends your business is to ask it the questions your customers ask and write down what it says. This guide shows how to do that so the results mean something.",
    sections: [
      {
        question: "How do I check if ChatGPT recommends my business?",
        answer: [
          "Ask ChatGPT the questions a new customer would ask, such as \"Who is the best plumber in Tampa, FL?\", in a chat that is not personalized to you. Then record whether your business was mentioned, recommended, or linked as a source. Repeat the same questions on a schedule, because one answer on one day is a sample, not a verdict.",
        ],
      },
      {
        question: "Why can't I just ask ChatGPT about my business by name?",
        answer: [
          "Because customers rarely do. Asking \"What do you know about Smith Plumbing?\" tells you whether ChatGPT can find your business when given its name. It does not tell you whether ChatGPT suggests you to someone who only asked for a plumber. Both are worth knowing, but the second is the one that brings new customers.",
        ],
      },
      {
        question: "Why might ChatGPT show me different answers than my customers see?",
        answer: [
          "ChatGPT can tailor answers to the person asking. If you have used it to talk about your own business, it may remember that and lean toward you. OpenAI's help pages say saved memories can be used when ChatGPT rewrites a search, and that it uses an approximate location based on your IP address to find local results.",
          "So a check from your own account, at your own shop, is the least reliable version of the test.",
        ],
      },
      {
        question: "How do I run a fair check?",
        answer: ["Remove as much of yourself from the test as you can, and keep the conditions the same each time."],
        list: [
          "Use a temporary chat and choose the unpersonalized option before the first message, or use ChatGPT while signed out. OpenAI says people who are not signed in can still use web search.",
          "Put the city or area in the question, so the answer does not depend on where you happen to be.",
          "Make sure the answer used web search. Answers that searched the web usually show sources you can open.",
          "Write ten questions customers really ask, including at least one for each main service.",
          "Ask each question the same way every time, and keep the exact wording in a list.",
        ],
      },
      {
        question: "What should I write down for each question?",
        answer: ["Record the same few things every time, so you can compare one month with the next."],
        list: [
          "The date, the exact question, and whether you were signed in.",
          "Whether your business was named at all.",
          "Whether it was recommended, or only mentioned in a list.",
          "Whether a page from your website was cited as a source.",
          "Which competitors were named instead.",
          "Anything ChatGPT said about you that was wrong, such as an old phone number or a service you do not offer.",
        ],
      },
      {
        question: "Why do I get a different answer when I ask again?",
        answer: [
          "AI products write each answer fresh, and the web pages they find can change, so the same question can produce a different list on a different day. That is why one check proves little. A pattern over several weeks, across ten questions, is far more useful than any single reply.",
        ],
      },
      {
        question: "What if ChatGPT never mentions my business?",
        answer: [
          "Start with the things that stop ChatGPT from using your site at all. OpenAI says there is no way to guarantee top placement, and that being included depends on allowing its search crawler, OAI-SearchBot, to reach your site. After that, the usual gaps are text that only appears after JavaScript runs, no structured data describing the business, and service pages that never say plainly what you do and where.",
          "Fix the gaps, give it a few weeks, then run the same ten questions again.",
        ],
      },
      {
        question: "Does this tell me how I do in other AI products?",
        answer: [
          "No. Google's AI Overviews, Perplexity, Microsoft Copilot, and Claude each find and choose sources in their own way. A business can appear in one and not another, so each product has to be checked separately with the same questions.",
        ],
      },
      {
        question: "Is there a faster way to see what might be holding me back?",
        answer: [
          "The free RAimondAI audit checks the website side: whether OAI-SearchBot and other AI crawlers are allowed, how much text they actually receive, and whether your structured data and service pages give them what they need. It does not ask ChatGPT about you, so it cannot tell you whether you are being recommended. It shows what to fix so that you have a better chance.",
        ],
      },
    ],
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
