import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "../ScrollReveal";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import { siteConfig } from "../site-config";

export const metadata: Metadata = {
  title: "Médiathèque — CAMS",
  description: "Photos, vidéos et documents des activités du Cabinet d’Accompagnement et de Management Social.",
};

const { photos, videos, documents } = siteConfig.mediatheque;

function Empty({ text }: { text: string }) {
  return <div className="empty-state"><span className="empty-icon" aria-hidden="true">✳</span><p>{text}</p></div>;
}

export default function Mediatheque() {
  return <main>
    <SiteHeader />
    <ScrollReveal />
    <section className="page-hero" id="accueil">
      <div className="section-kicker">MÉDIATHÈQUE</div>
      <h1>Nos activités <em>en images.</em></h1>
      <p>Retrouvez les photos, vidéos et documents de nos ateliers, formations, sensibilisations et interventions.</p>
    </section>
    <section className="section media-page">
      <div className="media-block">
        <div className="section-head"><div><div className="section-kicker">01 / PHOTOS</div><h2>Moments <em>d’accompagnement.</em></h2></div></div>
        {photos.length ? <div className="media-grid">{photos.map((p) => <figure className="media-photo" key={p.src}><div><Image src={p.src} alt={p.alt} fill sizes="(max-width: 620px) 92vw, 30vw" /></div><figcaption>{p.caption}</figcaption></figure>)}</div>
          : <Empty text="Les photos de nos activités seront publiées ici très prochainement." />}
      </div>
      <div className="media-block">
        <div className="section-head"><div><div className="section-kicker">02 / VIDÉOS</div><h2>Paroles <em>et témoignages.</em></h2></div></div>
        {videos.length ? <ul className="media-list">{videos.map((v) => <li key={v.title}><a href={v.url} target="_blank" rel="noopener noreferrer">{v.title} <span>↗</span></a></li>)}</ul>
          : <Empty text="Nos vidéos et témoignages seront bientôt disponibles." />}
      </div>
      <div className="media-block">
        <div className="section-head"><div><div className="section-kicker">03 / DOCUMENTS</div><h2>Ressources <em>à télécharger.</em></h2></div></div>
        {documents.length ? <ul className="media-list">{documents.map((d) => <li key={d.href}><a href={d.href} target="_blank" rel="noopener noreferrer">{d.title} <span>↓</span></a></li>)}</ul>
          : <Empty text="Guides, fiches pratiques et rapports seront mis en ligne ici." />}
      </div>
      <div className="page-cta"><p>Vous souhaitez organiser un atelier ou une sensibilisation ?</p><Link className="button dark" href="/#contact">Nous contacter <span>↗</span></Link></div>
    </section>
    <SiteFooter />
  </main>;
}
