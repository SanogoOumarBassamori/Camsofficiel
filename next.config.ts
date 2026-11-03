import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
