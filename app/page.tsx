import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "./ContactForm";
import JsonLd from "./JsonLd";
import ScrollReveal from "./ScrollReveal";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { getContent, waNumber } from "./_server/store";
import { services, siteConfig } from "./site-config";
import { pageMeta, siteName, siteUrl } from "./seo";

export const metadata: Metadata = pageMeta("/", undefined, "Cabinet à Abidjan : accompagnement social et psychosocial, management social, médiation, formation et nutrition pour particuliers, entreprises, écoles et ONG.");

const audiences = [
  { n: "01", title: "Particuliers & familles", text: "Pour les difficultés sociales, familiales, relationnelles ou personnelles.", services: "Accueil et écoute · Accompagnement social et psychosocial · Orientation vers les services et professionnels appropriés · Médiation familiale et relationnelle · Accompagnement des personnes vulnérables · Soutien à la parentalité · Accompagnement face aux situations de crise · Prévention et gestion des conflits familiaux · Développement personnel et coaching · Sensibilisation à la nutrition et aux bonnes habitudes alimentaires · Accompagnement en diététique selon les besoins et le champ de compétence." },
  { n: "02", title: "Entreprises & organisations", text: "Pour renforcer le management social et la qualité du fonctionnement humain.", services: "Diagnostic social et organisationnel · Management social · Prévention et gestion des conflits · Prévention des risques psychosociaux · Amélioration du climat social · Accompagnement du changement · Qualité de vie et bien-être au travail · Gestion des situations sociales sensibles · Dispositifs d’écoute · Gestion des plaintes et mécanismes de recours · Formation et renforcement des capacités · Coaching individuel et collectif · Sensibilisation aux comportements professionnels et relationnels." },
  { n: "03", title: "Établissements d’enseignement", text: "Pour accompagner les structures éducatives, leurs équipes et leurs publics.", services: "Mise en place et dynamisation des cellules d’écoute · Gestion et traitement des plaintes · Accompagnement social des étudiants et personnels · Prévention et gestion des violences basées sur le genre · Médiation et résolution des conflits · Prévention du stress et des difficultés psychosociales · Promotion du bien-être et de la qualité de vie éducative · Formation des acteurs sociaux · Élaboration de procédures et outils d’accompagnement · Diagnostic social et organisationnel · Accompagnement des dispositifs de protection et d’orientation." },
  { n: "04", title: "ONG, associations & projets", text: "Pour soutenir les structures du développement social et communautaire.", services: "Diagnostic social · Études et enquêtes sociales · Appui à la conception et à la mise en œuvre de projets · Formation des équipes · Renforcement des capacités · Accompagnement des mécanismes de gestion des plaintes · Protection des personnes vulnérables · Prévention des VBG · Médiation communautaire · Sensibilisation et mobilisation communautaire · Accompagnement psychosocial · Suivi et évaluation des interventions sociales." },
  { n: "05", title: "Administrations & collectivités", text: "Pour renforcer l’action sociale et le management humain des institutions.", services: "Diagnostic social et institutionnel · Conseil en management social · Accompagnement des réformes et changements organisationnels · Dispositifs d’écoute et de gestion des plaintes · Formation des agents · Médiation institutionnelle · Prévention des conflits · Accompagnement des politiques et programmes sociaux · Études et analyses sociales · Promotion du bien-être des agents, des usagers et des communautés." },
];


// Questions fréquentes : affichées sur la page et reprises telles quelles dans les données structurées pour Google.
const faqs = [
  ["Où se trouve le CAMS et où intervient-il ?", "Le CAMS est basé à Abidjan. Les rendez-vous ont lieu au cabinet, dans vos locaux, en visioconférence ou par téléphone, ce qui permet d’accompagner des personnes et des structures dans toute la Côte d’Ivoire."],
  ["À qui s’adresse le cabinet ?", "Aux particuliers et aux familles, aux entreprises et organisations, aux établissements d’enseignement, aux ONG, associations et projets, ainsi qu’aux administrations et collectivités."],
  ["Comment prendre rendez-vous ?", "Remplissez le formulaire de cette page en choisissant le domaine, le type de rendez-vous, la date et le créneau souhaités, ou écrivez-nous directement sur WhatsApp. Nous vous recontactons pour confirmer."],
  ["L’accompagnement est-il confidentiel ?", "Oui. Chaque demande est accueillie dans le respect de la confidentialité, de l’éthique et de la dignité de la personne accompagnée."],
  ["Quels services proposez-vous aux entreprises ?", "Diagnostic social et organisationnel, management social, prévention des risques psychosociaux et des conflits, qualité de vie au travail, dispositifs d’écoute et de gestion des plaintes, formation et coaching individuel ou collectif."],
  ["Accompagnez-vous les écoles, les ONG et les projets ?", "Oui : mise en place de cellules d’écoute, gestion des plaintes, prévention des violences basées sur le genre, médiation, études et enquêtes sociales, formation des équipes et renforcement des capacités."],
  ["Proposez-vous un suivi en nutrition ?", "Oui. Le CAMS propose de l’éducation nutritionnelle et un accompagnement en diététique selon les besoins et le champ de compétence de ses intervenants."],
];

// Étapes de l’approche, chacune avec son pictogramme (24 × 24, contour).
const steps = [
  { title: "Écouter", text: "Accueillir la demande avec attention et confidentialité.", icon: ["M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.3A8.5 8.5 0 1 1 21 11.5z", "M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"] },
  { title: "Comprendre", text: "Analyser les besoins et les réalités de la situation.", icon: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-4-4"] },
  { title: "Accompagner", text: "Proposer une réponse adaptée, une orientation ou une médiation.", icon: ["M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20", "M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35", "M15.5 4.15a3.5 3.5 0 0 1 0 6.7"] },
  { title: "Suivre", text: "Faire le point sur l’accompagnement et ses suites.", icon: ["M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z", "M16 5h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2", "M9 14l2 2 4-4"] },
  { title: "Évaluer", text: "Mesurer les résultats obtenus et ajuster l’accompagnement si nécessaire.", icon: ["M4 20h16", "M7 17v-5", "M12 17V7", "M17 17V9"] },
];

const axes = [
  { n: "01", title: "Accompagner", line: "Écouter · Orienter · Soutenir · Concilier", text: "Accompagnement social et psychosocial, écoute, orientation, gestion des plaintes et soutien aux personnes vulnérables.", img: "/images/ecoute-soutien.webp", alt: "Une accompagnatrice soutient une personne en difficulté" },
  { n: "02", title: "Développer & transformer", line: "Former · Conseiller · Coacher · Renforcer", text: "Formation, conseil, management social et accompagnement des personnes et des organisations.", img: "/images/formation-abidjan.webp", alt: "Atelier de formation à Abidjan" },
  { n: "03", title: "Prévenir & promouvoir", line: "Prévenir · Promouvoir · Améliorer", text: "Prévention des risques psychosociaux et des conflits, qualité de vie, bien-être et éducation nutritionnelle.", img: "/images/reunion-cote-ivoire.webp", alt: "Séance de travail collective en Côte d’Ivoire" },
];

export default async function Home() {
  const { contact, partners } = await getContent();
  const n = (i: number) => String(i + (partners.length > 0 ? 1 : 0)).padStart(2, "0");
  return <main>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": `${siteUrl}/#site`, url: `${siteUrl}/`, name: "CAMS", inLanguage: "fr" },
        {
          "@type": "ProfessionalService", "@id": `${siteUrl}/#cams`, name: siteName, alternateName: "CAMS", url: `${siteUrl}/`,
          logo: `${siteUrl}/logo.jpg`, image: `${siteUrl}/images/accueil-professionnelle.webp`,
          description: "Cabinet d’accompagnement social et psychosocial, de management social, de médiation, de formation et de nutrition à Abidjan.",
          email: contact.email, telephone: contact.phone,
          address: { "@type": "PostalAddress", addressLocality: "Abidjan", addressCountry: "CI" },
          areaServed: { "@type": "Country", name: "Côte d’Ivoire" },
          knowsLanguage: "fr",
          contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: contact.whatsapp, availableLanguage: "French" },
          ...(siteConfig.socialLinks.length ? { sameAs: siteConfig.socialLinks.map((l) => l.href) } : {}),
          hasOfferCatalog: { "@type": "OfferCatalog", name: "Domaines d’accompagnement", itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.text, areaServed: "Côte d’Ivoire" } })) },
        },
        { "@type": "FAQPage", "@id": `${siteUrl}/#faq`, mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ],
    }} />
    <SiteHeader />
    <ScrollReveal />
    <section className="hero" id="accueil"><div className="hero-copy"><div className="eyebrow"><i /> CABINET D’ACCOMPAGNEMENT & DE MANAGEMENT SOCIAL</div><h1>Transformez vos défis sociaux en <em>leviers de réussite.</em></h1><p className="hero-sub">Accompagner <b>•</b> Prévenir <b>•</b> Transformer</p><p className="hero-text">À Abidjan et partout en Côte d’Ivoire, le CAMS accompagne les personnes, les familles et les organisations face aux enjeux sociaux, psychosociaux, relationnels et professionnels.</p><div className="hero-actions"><a className="button dark" href="#services">Découvrir nos services <span>↗</span></a><a className="text-link" href="#cabinet">Découvrir le CAMS <span>↓</span></a></div><div className="hero-note"><span className="note-mark">✳</span><span>Une écoute attentive.<br /><strong>Un accompagnement adapté.</strong></span></div></div><div className="hero-art"><figure className="hero-photo"><Image src="/images/accueil-professionnelle.webp" alt="Professionnelle africaine souriante à son bureau" fill preload sizes="(max-width: 620px) 92vw, 44vw" /></figure><div className="art-card"><div className="art-leaf">✳</div><span>LA CONVICTION DU CAMS</span><blockquote>« Une personne bien accompagnée est mieux armée pour faire face aux difficultés. »</blockquote><i /></div><div className="art-caption">ABIDJAN · CÔTE D’IVOIRE</div></div></section>
    <section className="domains-marquee" aria-label="Domaines d’accompagnement du CAMS">
      <p className="domains-label">NOS DOMAINES D’ACCOMPAGNEMENT</p>
      <div className="domains-window">
        <div className="domains-track">
          <div className="domains-group">
            <span>Accompagnement social</span><i>✳</i><span>Management social</span><i>✳</i><span>Formation & coaching</span><i>✳</i><span>Prévention & bien-être</span><i>✳</i><span>Médiation & gestion des plaintes</span><i>✳</i><span>Nutrition & diététique</span><i>✳</i>
          </div>
          <div className="domains-group" aria-hidden="true">
            <span>Accompagnement social</span><i>✳</i><span>Management social</span><i>✳</i><span>Formation & coaching</span><i>✳</i><span>Prévention & bien-être</span><i>✳</i><span>Médiation & gestion des plaintes</span><i>✳</i><span>Nutrition & diététique</span><i>✳</i>
          </div>
        </div>
      </div>
    </section>    <section className="intro section" id="cabinet"><div className="section-kicker">01 / QUI SOMMES-NOUS ?</div><div className="intro-grid"><div><h2>Des solutions pensées<br />pour <em>chaque réalité.</em></h2><figure className="intro-photo"><Image src="/images/entretien-accompagnement.webp" alt="Entretien d’accompagnement individuel avec une professionnelle" fill sizes="(max-width: 620px) 92vw, 42vw" /></figure></div><div><p className="lead">Basé à Abidjan, le Cabinet d’Accompagnement et de Management Social (CAMS) est spécialisé dans l’accompagnement social et psychosocial, le management social, la formation, la médiation et la nutrition, au service des personnes, des familles et des organisations en Côte d’Ivoire.</p><a className="under-link" href="#approche">Notre vision, notre mission & nos valeurs <span>↗</span></a></div></div><div className="values"><div><span>NOTRE VISION</span><p>Devenir un cabinet de référence en management social, ingénierie psycho-sociale et nutritionnelle en Côte d’Ivoire.</p></div><div><span>NOTRE MISSION</span><p>Accompagner les individus, les organisations et les institutions éducatives dans la résolution de leurs difficultés sociales, humaines et organisationnelles afin de favoriser leur stabilité, leur performance et leur autonomie.</p></div><div><span>NOS VALEURS</span><p>Intégrité absolue ,Inclusion et dignité ,Impartialité radicale ,Bienveillance opérationnelle ,Innovation responsable et Autonomisation.</p></div></div></section>
    <section className="service-section section" id="services"><div className="section-head"><div><div className="section-kicker">02 / NOTRE SAVOIR-FAIRE</div><h2>Un accompagnement<br /><em>à plusieurs dimensions.</em></h2></div><p>Des expertises mobilisées de manière complémentaire, selon les besoins réels de chaque situation.</p></div><div className="service-grid">{services.map((s, i) => <article className="service-card" key={s.title}><figure className="service-photo"><Image src={`/images/${s.img}.webp`} alt={s.alt} fill sizes="(max-width: 620px) 92vw, (max-width: 900px) 45vw, 30vw" /></figure><div className="service-body"><div className="card-top"><span className="service-icon"><svg viewBox="0 0 24 24" aria-hidden="true">{s.icon.map(d => <path key={d} d={d} />)}</svg></span><span className="service-n">0{i + 1}</span></div><h3>{s.title}</h3><p>{s.text}</p></div></article>)}</div></section>
    <section className="audiences section" id="publics"><div className="section-head"><div><div className="section-kicker">03 / NOS PUBLICS</div><h2>À chaque public,<br /><em>un accompagnement dédié.</em></h2></div><p>Nous adaptons nos interventions aux réalités et aux besoins des personnes et des structures que nous accompagnons.</p></div><div className="audience-list">{audiences.map(a => <details key={a.n}><summary><span className="audience-n">{a.n}</span><h3>{a.title}</h3><p>{a.text}</p><span className="audience-plus">＋</span></summary><div className="audience-services"><span>PRESTATIONS</span><p>{a.services}</p></div></details>)}</div></section>
    <section className="axes section" id="axes"><div className="section-kicker">04 / NOS TROIS GRANDS AXES</div><div className="axes-head"><h2>Agir avec sens.<br /><em>Faire avancer les choses.</em></h2><p>Une offre intégrée pour accompagner, développer et prévenir.</p></div><div className="axis-grid">{axes.map(a => <article key={a.n}><figure className="axis-photo"><Image src={a.img} alt={a.alt} fill sizes="(max-width: 620px) 92vw, 30vw" /></figure><span className="axis-n">AXE {a.n}</span><h3>{a.title}</h3><span className="axis-line">{a.line}</span><p>{a.text}</p></article>)}</div></section>
    <section className="approach section" id="approche"><div className="section-head"><div><div className="section-kicker">05 / NOTRE APPROCHE</div><h2>La bonne réponse<br />commence par <em>l’écoute.</em></h2></div><p>Chaque situation est unique. Le CAMS privilégie des réponses personnalisées et adaptées, dans le respect de la confidentialité, de l’éthique et de la dignité.</p></div><ol className="steps">{steps.map((s, i) => <li className="step" key={s.title}><div className="step-shape"><i><svg viewBox="0 0 24 24" aria-hidden="true">{s.icon.map((d) => <path key={d} d={d} />)}</svg></i></div><div className="step-body"><span className="step-n">0{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></div></li>)}</ol></section>
    <section className="quote"><div className="quote-star">✳</div><p>Votre situation mérite une écoute.<br /><em>Votre organisation mérite un accompagnement.</em></p><span>CAMS · L’HUMAIN AU CŒUR DES SOLUTIONS SOCIALES</span></section>
    {partners.length > 0 && <section className="partners section" id="partenaires">
      <div className="section-head"><div><div className="section-kicker">06 / NOS PARTENAIRES</div><h2>Ils nous font <em>confiance.</em></h2></div><p>Institutions, entreprises et associations avec lesquelles le CAMS agit au service des personnes et des organisations.</p></div>
      <ul className="partner-grid">{partners.map((p) => {
        const inner = <>{p.logo ? <span className="partner-logo"><Image src={p.logo} alt="" fill sizes="(max-width: 620px) 40vw, 200px" unoptimized /></span> : <span className="partner-initials" aria-hidden="true">{p.name.slice(0, 2).toUpperCase()}</span>}<span className="partner-name">{p.name}</span></>;
        return <li className="partner-card" key={p.id}>{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{inner}</a> : <div>{inner}</div>}</li>;
      })}</ul>
    </section>}
    <section className="audiences section faq" id="questions"><div className="section-head"><div><div className="section-kicker">{n(6)} / QUESTIONS FRÉQUENTES</div><h2>Vos questions,<br /><em>nos réponses.</em></h2></div><p>L’essentiel à savoir avant de prendre contact avec le cabinet.</p></div><div className="audience-list faq-list">{faqs.map(([q, a], i) => <details key={q}><summary><span className="audience-n">{String(i + 1).padStart(2, "0")}</span><h3>{q}</h3><span className="audience-plus">＋</span></summary><div className="audience-services"><p>{a}</p></div></details>)}</div></section>
    <section className="contact section" id="contact"><div><div className="section-kicker">{n(7)} / CONTACT</div><h2>Échangeons sur<br /><em>votre besoin.</em></h2><p>Une première prise de contact permet de mieux comprendre votre situation et d’identifier la suite adaptée.</p><div className="contact-place">⌖ &nbsp;{siteConfig.location}</div><p className="contact-config">E-mail : {contact.email} · Téléphone : {contact.phone} · WhatsApp : {contact.whatsapp}</p></div><div className="contact-box"><span>PARLONS DE VOTRE DEMANDE</span><ContactForm whatsappNumber={waNumber(contact.whatsapp)} /></div></section>
    <SiteFooter />
  </main>;
}
