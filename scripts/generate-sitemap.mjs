import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE_URL || "https://raimondai.com";
const now = new Date().toISOString();

const urls = [
  "/", "/journal", "/privacy", "/terms"
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${BASE}${u}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u === "/" ? "1.0" : "0.7"}</priority>
  </url>`).join("")}
</urlset>`.trim();

const outDir = resolve("dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "sitemap.xml"), xml);
console.log("✓ sitemap.xml written");