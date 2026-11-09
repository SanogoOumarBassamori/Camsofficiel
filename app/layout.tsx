import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./refresh.css";
import { defaultTitle, shareImage, siteName, siteUrl } from "./seo";

// Polices hébergées par le site lui-même : plus de détour par Google au chargement, texte affiché plus vite.
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: "%s | CAMS Abidjan" },
  description: "Cabinet à Abidjan : accompagnement psychosocial, management social, consultance, médiation, formation et nutrition pour particuliers, entreprises, écoles et ONG.",
  applicationName: "CAMS",
  openGraph: { type: "website", locale: "fr_CI", siteName, images: [shareImage] },
  twitter: { card: "summary_large_image", images: [shareImage.url] },
  // Code fourni par Google Search Console (méthode « balise HTML »), à mettre dans GOOGLE_SITE_VERIFICATION.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable}`}><body>{children}<div className="site-band"><span>UNE APPROCHE HUMAINE & PROFESSIONNELLE</span><span>CONFIDENTIALITÉ&nbsp; · &nbsp;DIGNITÉ&nbsp; · &nbsp;ÉCOUTE</span></div></body></html>;
}
