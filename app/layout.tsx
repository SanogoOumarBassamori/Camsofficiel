import type { Metadata } from "next";
import "./globals.css";
import "./refresh.css";

export const metadata: Metadata = {
  title: "CAMS — L’humain au cœur des solutions sociales",
  description: "Le Cabinet d’Accompagnement et de Management Social accompagne les personnes, familles et organisations en Côte d’Ivoire.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}<div className="site-band"><span>UNE APPROCHE HUMAINE & PROFESSIONNELLE</span><span>CONFIDENTIALITÉ&nbsp; · &nbsp;DIGNITÉ&nbsp; · &nbsp;ÉCOUTE</span></div></body></html>;
}
