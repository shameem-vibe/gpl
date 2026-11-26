import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Hind_Siliguri, Inter } from "next/font/google";
import { SITE } from "@/lib/constants/site";
import "@/styles/globals.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const bn = Hind_Siliguri({ subsets: ["bengali"], weight: ["400", "500", "600"], variable: "--font-bn", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} (GPL) · ${SITE.tagline}`, template: `%s · ${SITE.short}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, title: SITE.name, description: SITE.description, locale: "en_BD" },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#06231A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${bn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
