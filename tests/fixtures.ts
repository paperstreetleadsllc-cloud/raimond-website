import { AuditError, type FetchResult, type Fetcher } from "@/lib/audit/types";

export interface FakeResponse {
  status?: number;
  contentType?: string;
  body?: string;
  /** Simulate a redirect to this absolute URL. */
  redirectTo?: string;
  delayMs?: number;
  throws?: AuditError;
}

/** In-memory website. Lets the whole pipeline run with no network access. */
export function fakeSite(routes: Record<string, FakeResponse>): Fetcher & { calls: string[] } {
  const calls: string[] = [];
  const fetcher = (async (url: string, opts): Promise<FetchResult> => {
    calls.push(url);
    let current = url;
    const redirects: string[] = [];
    for (let i = 0; i < 6; i++) {
      const route = routes[current] ?? routes[current.replace(/\/$/, "")];
      if (!route) {
        return { requestedUrl: url, finalUrl: current, status: 404, contentType: "text/html", body: "<html><body>Not found</body></html>", bytes: 40, truncated: false, redirects, elapsedMs: 5 };
      }
      if (route.throws) throw route.throws;
      if (route.delayMs) {
        if (route.delayMs > opts.timeoutMs) {
          await new Promise((r) => setTimeout(r, opts.timeoutMs));
          throw new AuditError("TIMEOUT", "The website took too long to respond.");
        }
        await new Promise((r) => setTimeout(r, route.delayMs));
      }
      if (route.redirectTo) {
        current = route.redirectTo;
        redirects.push(current);
        continue;
      }
      const body = (route.body ?? "").slice(0, opts.maxBytes);
      return {
        requestedUrl: url,
        finalUrl: current,
        status: route.status ?? 200,
        contentType: route.contentType ?? "text/html; charset=utf-8",
        body,
        bytes: body.length,
        truncated: (route.body ?? "").length > opts.maxBytes,
        redirects,
        elapsedMs: 120,
      };
    }
    throw new AuditError("UNREACHABLE", "The website redirected too many times.");
  }) as Fetcher & { calls: string[] };
  fetcher.calls = calls;
  return fetcher;
}

const filler = (topic: string, n = 60) =>
  Array.from({ length: n }, (_, i) => `Our team handles ${topic} for homeowners with care and clear pricing, visit ${i + 1}.`).join(" ");

const nav = `<nav><a href="/">Home</a><a href="/services/drain-cleaning">Drain Cleaning</a><a href="/services/water-heater-repair">Water Heater Repair</a><a href="/services/leak-detection">Leak Detection</a><a href="/about">About Us</a><a href="/contact">Contact</a><a href="/faq">FAQ</a><a href="/privacy-policy">Privacy Policy</a><a href="tel:+18135550142">(813) 555-0142</a><a href="https://www.facebook.com/acmeplumbingtampa">Facebook</a><a href="https://www.yelp.com/biz/acme-plumbing-tampa">Yelp</a></nav>`;

const page = (title: string, h1: string, body: string, head = "") => `<!doctype html><html lang="en"><head><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${title}. Licensed and insured plumbers serving Tampa, FL with same-day service.">
<link rel="canonical" href="">${head}</head><body>${nav}<main><h1>${h1}</h1>${body}</main>
<footer>Acme Plumbing, 100 Main Street, Tampa, FL 33602. Call (813) 555-0142. Licensed and insured. Family owned since 1998.</footer></body></html>`;

const businessSchema = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Plumber",
  name: "Acme Plumbing",
  telephone: "+1-813-555-0142",
  url: "https://acmeplumbing-tampa.com/",
  address: { "@type": "PostalAddress", streetAddress: "100 Main Street", addressLocality: "Tampa", addressRegion: "FL", postalCode: "33602" },
  areaServed: ["Tampa", "St. Petersburg"],
  openingHours: "Mo-Su 00:00-23:59",
  sameAs: ["https://www.facebook.com/acmeplumbingtampa"],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "212" },
})}</script>`;

const O = "https://acmeplumbing-tampa.com";

/** A well-built local plumbing site. */
export function goodSite(): Record<string, FakeResponse> {
  return {
    [`${O}/robots.txt`]: { contentType: "text/plain", body: `User-agent: *\nDisallow: /wp-admin/\nSitemap: ${O}/sitemap.xml\n` },
    [`${O}/sitemap.xml`]: {
      contentType: "application/xml",
      body: `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", "/services/drain-cleaning", "/services/water-heater-repair", "/services/leak-detection", "/about", "/contact", "/faq"].map((p) => `<url><loc>${O}${p}</loc></url>`).join("")}</urlset>`,
    },
    [`${O}/`]: { body: page("Plumber in Tampa, FL | Acme Plumbing", "Tampa Plumber You Can Trust", `<h2>Our plumbing services</h2><ul><li>Drain cleaning</li><li>Water heater repair</li></ul><h2>Why choose us</h2><p>${filler("plumbing in Tampa, FL")}</p><h2>What our customers say</h2><p>Read our reviews and testimonials.</p>`, businessSchema) },
    [`${O}/services/drain-cleaning`]: { body: page("Drain Cleaning in Tampa, FL | Acme Plumbing", "Drain Cleaning in Tampa", `<h2>What is included</h2><ul><li>Camera inspection</li></ul><h2>How much does drain cleaning cost?</h2><p>${filler("drain cleaning")}</p><h2>How long does drain cleaning take?</h2><p>About an hour.</p>`) },
    [`${O}/services/water-heater-repair`]: { body: page("Water Heater Repair in Tampa, FL | Acme Plumbing", "Water Heater Repair in Tampa", `<h2>Signs you need repair</h2><ul><li>No hot water</li></ul><h2>Should I repair or replace my water heater?</h2><p>${filler("water heater repair")}</p>`) },
    [`${O}/services/leak-detection`]: { body: page("Leak Detection in Tampa, FL | Acme Plumbing", "Leak Detection in Tampa", `<h2>How we find leaks</h2><ul><li>Acoustic sensors</li></ul><h2>How do I know if I have a hidden leak?</h2><p>${filler("leak detection")}</p>`) },
    [`${O}/about`]: { body: page("About Us | Acme Plumbing", "About Acme Plumbing", `<h2>Our story</h2><p>${filler("plumbing")}</p><h2>Our team</h2><p>Certified, bonded plumbers with over 25 years of experience.</p>`) },
    [`${O}/contact`]: { body: page("Contact | Acme Plumbing", "Contact Acme Plumbing", `<h2>Request service</h2><form><input name="name"><input name="phone"><textarea name="msg"></textarea></form><h2>Email</h2><a href="mailto:office@acmeplumbing-tampa.com">Email us</a><p>${filler("plumbing requests", 20)}</p>`) },
    [`${O}/faq`]: {
      body: page("Plumbing FAQ | Acme Plumbing", "Plumbing Questions, Answered", `<h2>Do you offer emergency plumbing?</h2><p>Yes, emergency plumbing is available day and night. Emergency plumbing calls are answered live.</p><h2>Are your plumbers licensed?</h2><p>${filler("licensing")}</p><h2>Do you charge for estimates?</h2><p>No.</p>`, `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Do you offer emergency plumbing?","acceptedAnswer":{"@type":"Answer","text":"Yes."}}]}</script>`),
    },
  };
}

const W = "https://weak-example-site.com";

/** A thin site: no robots, sitemap, schema, phone, or headings; content loaded by script. */
export function weakSite(): Record<string, FakeResponse> {
  return {
    [`${W}/robots.txt`]: { status: 404, body: "not found" },
    [`${W}/`]: { body: `<html><head><title>Home</title></head><body><div id="root"></div><a href="/page2">More</a><script src="/app.js"></script></body></html>` },
    [`${W}/page2`]: { body: `<html><head><title>Home</title></head><body><p>Welcome to our website.</p></body></html>` },
  };
}

export { O as GOOD_ORIGIN, W as WEAK_ORIGIN };
