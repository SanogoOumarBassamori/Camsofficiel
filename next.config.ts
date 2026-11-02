import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.81"],
  // Photos et PDF envoyés depuis le tableau de bord (10 Mo au plus, plus la marge du formulaire).
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;
