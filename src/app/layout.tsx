import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "RAimondAI | Get your business recommended by AI search", template: "%s | RAimondAI" },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, title: "When customers ask AI who to call, does it say your name?", description: SITE.description, url: SITE.url },
  twitter: { card: "summary", title: "RAimondAI", description: SITE.description },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
