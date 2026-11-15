import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // undici and cheerio run only on the server; keep them out of the bundler.
  serverExternalPackages: ["undici", "cheerio"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default nextConfig;
