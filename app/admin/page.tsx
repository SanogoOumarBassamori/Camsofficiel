import Image from "next/image";
import Link from "next/link";
import { messageIsGenuine, requireAdmin } from "../_server/auth";
import { getContent, listRequests, waNumber } from "../_server/store";
import { addDocument, addPhoto, addVideo, logout, removeMedia, removeMember, removePartner, removeRequest, saveContact, saveMember, savePartner, savePassword, setRequestStatus } from "./actions";
import { Confirm, Submit } from "./Buttons";
import IdleGuard from "./IdleGuard";

const icons: Record<string, string[]> = {
  demandes: ["M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M3 7l9 6 9-6"],
  coordonnees: ["M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.3a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.25 1z"],
  mediatheque: ["M3 5h18v14H3z", "M3 16l5-5 4 4 3-3 5 5", "M8.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"],
  equipe: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6", "M17 11a3 3 0 1 0 0-6", "M16 14.3c2.3.6 4 2.6 4 5.7"],
  partenaires: ["M3 21h18", "M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16", "M13 21V9h5a1 1 0 0 1 1 1v11", "M8 8h2M8 12h2M8 16h2"],
  compte: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"],
};

const tabs = [
  { id: "demandes", label: "Demandes", title: "Demandes de rendez-vous", desc: "Les demandes envoyées par le formulaire du site, la plus récente en premier." },
  { id: "coordonnees", label: "Coordonnées", title: "Coordonnées du cabinet", desc: "Affichées sur le site. Les demandes du formulaire sont envoyées à cette adresse e-mail et à ce numéro WhatsApp." },
  { id: "mediatheque", label: "Médiathèque", title: "Médiathèque", desc: "Publiez ou retirez les photos, vidéos et documents de la page Médiathèque." },
  { id: "equipe", label: "Équipe", title: "Équipe", desc: "Les membres affichés sur la page Notre équipe, dans cet ordre." },
  { id: "partenaires", label: "Partenaires", title: "Partenaires", desc: "Les partenaires affichés dans la rubrique « Nos partenaires » de la page d’accueil. La rubrique n’apparaît que s’il y a au moins un partenaire." },
  { id: "compte", label: "Mon compte", title: "Mon compte", desc: "Vos identifiants de connexion au tableau de bord." },
] as const;

const when = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Abidjan" });
const NavIcon = ({ name }: { name: string }) => <svg className="admin-ico" viewBox="0 0 24 24" aria-hidden="true">{icons[name].map((d) => <path key={d} d={d} />)}</svg>;

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string; err?: string; s?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const asked = params.tab;
  const ok = messageIsGenuine(params.ok, params.s) ? params.ok : undefined;
  const err = messageIsGenuine(params.err, params.s) ? params.err : undefined;
  const current = tabs.find((t) => t.id === asked) ?? tabs[0];
  const tab = current.id;
  const [content, requests] = await Promise.all([getContent(), listRequests()]);
  const fresh = requests.filter((r) => r.status === "nouvelle").length;

  return <div className="admin-layout">
    <IdleGuard />
    <aside className="admin-side">
      <Link href="/admin" className="admin-brand">
        <span className="admin-brand-logo"><Image src="/logo-header.webp" alt="CAMS" width={640} height={597} /></span>
        <span className="admin-brand-text"><b>CAMS</b><small>Tableau de bord</small></span>
      </Link>
      <nav className="admin-nav" aria-label="Rubriques du tableau de bord">
        {tabs.map((t) => <Link key={t.id} href={`/admin?tab=${t.id}`} aria-current={tab === t.id ? "page" : undefined}>
          <NavIcon name={t.id} /><span>{t.label}</span>
          {t.id === "demandes" && fresh > 0 && <b className="admin-count">{fresh}</b>}
        </Link>)}
      </nav>
      <div className="admin-side-foot">
        <Link href="/" target="_blank" className="admin-side-link">Voir le site ↗</Link>
        <form action={logout}><button type="submit" className="admin-side-link is-out">Se déconnecter</button></form>
      </div>
    </aside>

    <main className="admin-main">
      <header className="admin-topbar">
        <div><h1>{current.title}</h1><p>{current.desc}</p></div>
      </header>
      <div className="admin-content">
        {ok && <p className="admin-alert is-ok" role="status">✓ {ok}</p>}
        {err && <p className="admin-alert is-err" role="alert">{err}</p>}

        {tab === "demandes" && <section>
          <div className="admin-kpis">
            <div className="admin-kpi"><span className="admin-kpi-n">{requests.length}</span><span className="admin-kpi-l">Demandes au total</span></div>
            <div className="admin-kpi is-new"><span className="admin-kpi-n">{fresh}</span><span className="admin-kpi-l">Nouvelles à traiter</span></div>
            <div className="admin-kpi"><span className="admin-kpi-n">{requests.length - fresh}</span><span className="admin-kpi-l">Traitées</span></div>
          </div>
          {requests.length === 0 ? <p className="admin-empty">Aucune demande pour le moment. Elles apparaîtront ici dès qu’un visiteur remplira le formulaire.</p>
            : <div className="admin-list">{requests.map((r) => <article key={r.id} className={`admin-card admin-request${r.status === "nouvelle" ? " is-new" : ""}`}>
              <div className="admin-request-head">
                <div><h2>{r.name}</h2><p className="admin-muted">Reçue le {when(r.createdAt)} · {r.channel === "whatsapp" ? "via WhatsApp" : "par le formulaire"}</p></div>
                <span className="admin-badge">{r.status === "nouvelle" ? "Nouvelle" : "Traitée"}</span>
              </div>
              <dl>{r.fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              <div className="admin-actions">
                <a className="admin-primary" href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>Appeler</a>
                <a className="admin-whatsapp" href={`https://wa.me/${waNumber(r.phone)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <form action={setRequestStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={r.status === "nouvelle" ? "traitée" : "nouvelle"} />
                  <Submit className="admin-ghost" pendingText="…">{r.status === "nouvelle" ? "Marquer comme traitée" : "Remettre en nouvelle"}</Submit></form>
                <form action={removeRequest}><input type="hidden" name="id" value={r.id} /><Confirm message={`Supprimer définitivement la demande de ${r.name} ?`}>Supprimer</Confirm></form>
              </div>
            </article>)}</div>}
        </section>}

        {tab === "coordonnees" && <section>
          <form action={saveContact} className="admin-card admin-form">
            <label>Adresse e-mail<input name="email" type="email" required maxLength={254} defaultValue={content.contact.email} /></label>
            <label>Téléphone<input name="phone" type="tel" required pattern="[0-9 +\(\)\-.]{8,30}" defaultValue={content.contact.phone} /></label>
            <label>Numéro WhatsApp<input name="whatsapp" type="tel" required pattern="[0-9 +\(\)\-.]{8,30}" defaultValue={content.contact.whatsapp} /><small>Avec l’indicatif, par exemple +225 05 03 25 82 17.</small></label>
            <Submit className="admin-primary">Enregistrer</Submit>
          </form>
        </section>}

        {tab === "mediatheque" && <section>
          <div className="admin-grid3">
            <form action={addPhoto} className="admin-card admin-form">
              <h2>Ajouter une photo</h2>
              <label>Photo<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required /><small>JPG, PNG ou WebP, 8 Mo au plus.</small></label>
              <label>Légende<input name="caption" required maxLength={120} placeholder="Ex. : Atelier de formation, Abidjan" /></label>
              <Submit className="admin-primary" pendingText="Envoi…">Publier la photo</Submit>
            </form>
            <form action={addVideo} className="admin-card admin-form">
              <h2>Ajouter une vidéo</h2>
              <label>Titre<input name="title" required maxLength={120} placeholder="Ex. : Témoignage d’une entreprise" /></label>
              <label>Lien de la vidéo<input name="url" type="url" required placeholder="https://www.youtube.com/…" /><small>Copiez le lien de la vidéo publiée sur YouTube ou Facebook.</small></label>
              <Submit className="admin-primary">Publier la vidéo</Submit>
            </form>
            <form action={addDocument} className="admin-card admin-form">
              <h2>Ajouter un document</h2>
              <label>Titre<input name="title" required maxLength={120} placeholder="Ex. : Plaquette de présentation" /></label>
              <label>Fichier PDF<input name="file" type="file" accept="application/pdf" required /><small>PDF, 10 Mo au plus.</small></label>
              <Submit className="admin-primary" pendingText="Envoi…">Publier le document</Submit>
            </form>
          </div>
          <h2 className="admin-sub">Photos publiées ({content.photos.length})</h2>
          {content.photos.length === 0 ? <p className="admin-empty">Aucune photo publiée.</p>
            : <div className="admin-thumbs">{content.photos.map((p) => <figure key={p.id} className="admin-card">
              <div className="admin-thumb"><Image src={p.src} alt={p.alt} fill sizes="240px" unoptimized={p.src.startsWith("/media/")} /></div>
              <figcaption>{p.caption}</figcaption>
              <form action={removeMedia}><input type="hidden" name="id" value={p.id} /><Confirm message="Retirer cette photo du site ?">Retirer</Confirm></form>
            </figure>)}</div>}
          <h2 className="admin-sub">Vidéos publiées ({content.videos.length})</h2>
          {content.videos.length === 0 ? <p className="admin-empty">Aucune vidéo publiée.</p>
            : <ul className="admin-rows">{content.videos.map((v) => <li key={v.id} className="admin-card">
              <a href={v.url} target="_blank" rel="noopener noreferrer">{v.title} ↗</a>
              <form action={removeMedia}><input type="hidden" name="id" value={v.id} /><Confirm message="Retirer cette vidéo du site ?">Retirer</Confirm></form>
            </li>)}</ul>}
          <h2 className="admin-sub">Documents publiés ({content.documents.length})</h2>
          {content.documents.length === 0 ? <p className="admin-empty">Aucun document publié.</p>
            : <ul className="admin-rows">{content.documents.map((d) => <li key={d.id} className="admin-card">
              <a href={d.href} target="_blank" rel="noopener noreferrer">{d.title} ↓</a>
              <form action={removeMedia}><input type="hidden" name="id" value={d.id} /><Confirm message="Retirer ce document du site ?">Retirer</Confirm></form>
            </li>)}</ul>}
        </section>}

        {tab === "equipe" && <section>
          <form action={saveMember} className="admin-card admin-form admin-member-new">
            <h2>Ajouter un membre</h2>
            <label>Nom et prénom<input name="name" required maxLength={80} /></label>
            <label>Fonction<input name="role" required maxLength={120} placeholder="Ex. : Médiatrice — Gestion des plaintes" /></label>
            <label>Petite description (facultative)<textarea name="bio" maxLength={300} rows={3} placeholder="Ex. : 10 ans d’expérience en médiation familiale." /></label>
            <label>Photo (facultative)<input name="file" type="file" accept="image/jpeg,image/png,image/webp" /><small>Un portrait de face, 8 Mo au plus.</small></label>
            <Submit className="admin-primary" pendingText="Envoi…">Ajouter</Submit>
          </form>
          {content.team.length === 0 ? <p className="admin-empty">Aucun membre affiché pour le moment.</p>
            : <div className="admin-list">{content.team.map((m) => <article key={m.id} className="admin-card admin-member">
              <div className="admin-avatar">{m.photo ? <Image src={m.photo} alt={m.name} fill sizes="96px" unoptimized={m.photo.startsWith("/media/")} /> : <span aria-hidden="true">{m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>}</div>
              <form action={saveMember} className="admin-form">
                <input type="hidden" name="id" value={m.id} />
                <label>Nom et prénom<input name="name" required maxLength={80} defaultValue={m.name} /></label>
                <label>Fonction<input name="role" required maxLength={120} defaultValue={m.role} /></label>
                <label>Petite description (facultative)<textarea name="bio" maxLength={300} rows={3} defaultValue={m.bio ?? ""} /></label>
                <label>{m.photo ? "Changer la photo" : "Ajouter une photo"}<input name="file" type="file" accept="image/jpeg,image/png,image/webp" /></label>
                <Submit className="admin-primary" pendingText="Envoi…">Enregistrer</Submit>
              </form>
              <form action={removeMember}><input type="hidden" name="id" value={m.id} /><Confirm message={`Retirer ${m.name} de l’équipe affichée sur le site ?`}>Retirer de l’équipe</Confirm></form>
            </article>)}</div>}
        </section>}

        {tab === "partenaires" && <section>
          <form action={savePartner} className="admin-card admin-form admin-member-new">
            <h2>Ajouter un partenaire</h2>
            <label>Nom du partenaire<input name="name" required maxLength={100} placeholder="Ex. : Ministère de la Solidarité" /></label>
            <label>Site internet (facultatif)<input name="url" type="url" maxLength={300} placeholder="https://…" /></label>
            <label>Logo (facultatif)<input name="file" type="file" accept="image/jpeg,image/png,image/webp" /><small>De préférence un PNG sur fond transparent, 8 Mo au plus. Sans logo, le nom s’affiche.</small></label>
            <Submit className="admin-primary" pendingText="Envoi…">Ajouter</Submit>
          </form>
          {content.partners.length === 0 ? <p className="admin-empty">Aucun partenaire pour le moment : la rubrique est masquée sur le site.</p>
            : <div className="admin-list">{content.partners.map((p) => <article key={p.id} className="admin-card admin-member">
              <div className="admin-logo">{p.logo ? <Image src={p.logo} alt={p.name} fill sizes="96px" unoptimized /> : <span aria-hidden="true">{p.name.slice(0, 2).toUpperCase()}</span>}</div>
              <form action={savePartner} className="admin-form">
                <input type="hidden" name="id" value={p.id} />
                <label>Nom du partenaire<input name="name" required maxLength={100} defaultValue={p.name} /></label>
                <label>Site internet (facultatif)<input name="url" type="url" maxLength={300} defaultValue={p.url} placeholder="https://…" /></label>
                <label>{p.logo ? "Changer le logo" : "Ajouter un logo"}<input name="file" type="file" accept="image/jpeg,image/png,image/webp" /></label>
                <Submit className="admin-primary" pendingText="Envoi…">Enregistrer</Submit>
              </form>
              <form action={removePartner}><input type="hidden" name="id" value={p.id} /><Confirm message={`Retirer ${p.name} des partenaires affichés sur le site ?`}>Retirer des partenaires</Confirm></form>
            </article>)}</div>}
        </section>}

        {tab === "compte" && <section>
          <p className="admin-muted">Identifiant : <b>{process.env.ADMIN_USER || "cams"}</b>. Changer le mot de passe déconnecte les autres appareils.</p>
          <form action={savePassword} className="admin-card admin-form">
            <label>Nouveau mot de passe<input name="password" type="password" required minLength={10} autoComplete="new-password" /><small>10 caractères au moins.</small></label>
            <label>Confirmer le mot de passe<input name="confirm" type="password" required minLength={10} autoComplete="new-password" /></label>
            <Submit className="admin-primary">Changer le mot de passe</Submit>
          </form>
        </section>}
      </div>
    </main>
  </div>;
}
