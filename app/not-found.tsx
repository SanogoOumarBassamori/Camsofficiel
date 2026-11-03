import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export const metadata: Metadata = { title: "Page introuvable — CAMS" };

export default function NotFound() {
  return <main>
    <SiteHeader />
    <section className="page-hero" id="accueil">
      <div className="section-kicker">PAGE INTROUVABLE</div>
      <h1>Cette page <em>n’existe pas.</em></h1>
      <p>Le lien est peut-être incomplet ou la page a été déplacée.</p>
      <Link className="button dark" href="/" style={{ marginTop: 32 }}>Revenir à l’accueil <span>↗</span></Link>
    </section>
    <SiteFooter />
  </main>;
}
