import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "../JsonLd";
import ScrollReveal from "../ScrollReveal";
import { breadcrumb, pageMeta } from "../seo";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import { getContent } from "../_server/store";
import { poles } from "../site-config";

export const metadata: Metadata = pageMeta("/equipe", "Notre équipe et nos pôles d’expertise", "L’équipe du CAMS à Abidjan et ses quatre pôles : accompagnement psychosocial et coaching, management social et consultance, formation, nutrition et diététique.");

export default async function Equipe() {
  const { team } = await getContent();
  return <main>
    <JsonLd data={breadcrumb("Notre équipe", "/equipe")} />
    <SiteHeader />
    <ScrollReveal />
    <section className="page-hero" id="accueil">
      <div className="section-kicker">NOTRE ÉQUIPE</div>
      <h1>Des professionnels <em>engagés à vos côtés.</em></h1>
      <p>Des intervenants complémentaires, réunis autour d’une même exigence : l’écoute, la confidentialité et la dignité de chaque personne accompagnée.</p>
    </section>
    {team.length > 0 && <section className="section team-page">
      <div className="section-head"><div><div className="section-kicker">01 / L’ÉQUIPE</div><h2>Celles et ceux <em>qui vous accompagnent.</em></h2></div></div>
      <div className="team-grid">{team.map((m) => <article className="team-card" key={m.id}>
        <h3>{m.name}</h3>
        <div className="team-photo">{m.photo ? <Image src={m.photo} alt={m.name} fill sizes="(max-width: 620px) 92vw, 25vw" unoptimized={m.photo.startsWith("/media/")} /> : <span aria-hidden="true">{m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>}</div>
        <p className="team-role">{m.role}</p>
        {m.bio && <p className="team-bio">{m.bio}</p>}
      </article>)}</div>
    </section>}
    <section className="section team-page">
      <div className="section-head"><div><div className="section-kicker">{team.length ? "02" : "01"} / NOS PÔLES D’EXPERTISE</div><h2>Quatre pôles, <em>une même équipe.</em></h2></div><p>Chaque demande est confiée au pôle le plus adapté, et plusieurs pôles travaillent ensemble lorsque la situation le demande.</p></div>
      <div className="pole-grid">{poles.map((s, i) => <article className="pole-card" key={s.title}>
        <div className="card-top"><span className="service-icon"><svg viewBox="0 0 24 24" aria-hidden="true">{s.icon.map((d) => <path key={d} d={d} />)}</svg></span><span className="service-n">0{i + 1}</span></div>
        <h3>Pôle {s.title}</h3><p>{s.text}</p>
      </article>)}</div>
      <div className="page-cta"><p>Vous souhaitez rencontrer l’équipe ou rejoindre le CAMS ?</p><Link className="button dark" href="/#contact">Nous écrire <span>↗</span></Link></div>
    </section>
    <SiteFooter />
  </main>;
}
