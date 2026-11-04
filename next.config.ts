import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === "development";

// Politique de contenu : seules nos propres ressources (et les polices Google) peuvent se charger,
// le site ne peut pas être intégré ailleurs et les formulaires ne peuvent envoyer que vers le site.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.1.81"],
  // Photos et PDF envoyés depuis le tableau de bord (10 Mo au plus, plus la marge du formulaire).
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
  // En-têtes de sécurité sur toutes les pages : empêchent l’intégration du site dans une iframe
  // (vol de clic sur le tableau de bord), le reniflage de type et les fuites d’adresse.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
