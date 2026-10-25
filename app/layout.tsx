import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAMS — L’humain au cœur des solutions sociales",
  description: "Le Cabinet d’Accompagnement et de Management Social accompagne les personnes, familles et organisations en Côte d’Ivoire.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
