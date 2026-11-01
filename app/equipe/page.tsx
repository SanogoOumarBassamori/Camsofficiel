import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "../ScrollReveal";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import { services, siteConfig } from "../site-config";

export const metadata: Metadata = {
  title: "Nos équipes — CAMS",
  description: "Les équipes et pôles d’expertise du Cabinet d’Accompagnement et de Management Social.",
};

export default function Equipe() {
  const { team } = siteConfig;
  return <main>
    <SiteHeader />
    <ScrollReveal />
    <section className="page-hero" id="accueil">
      <div className="section-kicker">NOS ÉQUIPES</div>
      <h1>Des professionnels <em>engagés à vos côtés.</em></h1>
      <p>Des intervenants complémentaires, réunis autour d’une même exigence : l’écoute, la confidentialité et la dignité de chaque personne accompagnée.</p>
    </section>
    {team.length > 0 && <section className="section team-page">
      <div className="section-head"><div><div className="section-kicker">01 / L’ÉQUIPE</div><h2>Celles et ceux <em>qui vous accompagnent.</em></h2></div></div>
      <div className="team-grid">{team.map((m) => <article className="team-card" key={`${m.name}-${m.role}`}>
        <div className="team-photo">{m.photo ? <Image src={m.photo} alt={m.name} fill sizes="(max-width: 620px) 92vw, 25vw" /> : <span aria-hidden="true">{m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>}</div>
        <h3>{m.name}</h3><p>{m.role}</p>
      </article>)}</div>
    </section>}
    <section className="section team-page">
      <div className="section-head"><div><div className="section-kicker">{team.length ? "02" : "01"} / NOS PÔLES D’EXPERTISE</div><h2>Six domaines, <em>une même équipe.</em></h2></div><p>Chaque demande est confiée au pôle le plus adapté, et plusieurs pôles travaillent ensemble lorsque la situation le demande.</p></div>
      <div className="pole-grid">{services.map((s, i) => <article className="pole-card" key={s.title}>
        <div className="card-top"><span className="service-icon"><svg viewBox="0 0 24 24" aria-hidden="true">{s.icon.map((d) => <path key={d} d={d} />)}</svg></span><span className="service-n">0{i + 1}</span></div>
        <h3>Pôle {s.title}</h3><p>{s.text}</p>
      </article>)}</div>
      <div className="page-cta"><p>Vous souhaitez rencontrer l’équipe ou rejoindre le CAMS ?</p><Link className="button dark" href="/#contact">Nous écrire <span>↗</span></Link></div>
    </section>
    <SiteFooter />
  </main>;
}
