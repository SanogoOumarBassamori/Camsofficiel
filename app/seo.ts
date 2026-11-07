import type { Metadata } from "next";

// Adresse publique du site : à renseigner dans SITE_URL sur l’hébergeur dès que le nom de domaine définitif est choisi.
export const siteUrl = (process.env.SITE_URL || "https://cams.onrender.com").replace(/\/+$/, "");
export const siteName = "CAMS — Cabinet d’Accompagnement et de Management Social";
export const defaultTitle = "CAMS Abidjan — Accompagnement et management social en Côte d’Ivoire";
// Image d’aperçu (1200 × 630) quand un lien du site est partagé sur WhatsApp, Facebook, LinkedIn…
export const shareImage = { url: "/partage-cams.jpg", width: 1200, height: 630, alt: "CAMS, Cabinet d’Accompagnement et de Management Social à Abidjan, Côte d’Ivoire" };

// Métadonnées d’une page : titre, description, adresse canonique et aperçu sur les réseaux sociaux.
export function pageMeta(path: string, title: string | undefined, description: string): Metadata {
  const shareTitle = title ? `${title} | CAMS Abidjan` : defaultTitle;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "fr_CI", siteName, url: path, title: shareTitle, description, images: [shareImage] },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [shareImage.url] },
  };
}

// Fil d’Ariane pour Google : Accueil › page courante.
export function breadcrumb(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name, item: `${siteUrl}${path}` },
    ],
  };
}
