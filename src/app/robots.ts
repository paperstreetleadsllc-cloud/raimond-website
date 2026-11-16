import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/audit/", "/dashboard", "/auth/", "/login", "/signup", "/forgot-password", "/reset-password"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
