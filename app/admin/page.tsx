import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "../_server/auth";
import { getContent, listRequests, waNumber } from "../_server/store";
import { addDocument, addPhoto, addVideo, logout, removeMedia, removeMember, removePartner, removeRequest, saveContact, saveMember, savePartner, savePassword, setRequestStatus } from "./actions";
import { Confirm, Submit } from "./Buttons";

const tabs = [
  ["demandes", "Demandes"],
  ["coordonnees", "Coordonnées"],
  ["mediatheque", "Médiathèque"],
  ["equipe", "Équipe"],
  ["partenaires", "Partenaires"],
  ["compte", "Mon compte"],
] as const;

const when = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Abidjan" });

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string; err?: string }> }) {
  await requireAdmin();
  const { tab: asked, ok, err } = await searchParams;
  const tab = tabs.some(([id]) => id === asked) ? asked : "demandes";
  const [content, requests] = await Promise.all([getContent(), listRequests()]);
  const fresh = requests.filter((r) => r.status === "nouvelle").length;

  return <main className="admin">
    <header className="admin-top">
      <Link href="/admin" className="admin-brand"><Image src="/logo-header.webp" alt="CAMS" width={640} height={597} /> <span>Tableau de bord</span></Link>
      <div className="admin-top-actions">
        <Link href="/" target="_blank" className="admin-ghost">Voir le site ↗</Link>
        <form action={logout}><button type="submit" className="admin-ghost">Se déconnecter</button></form>
      </div>
    </header>
    <nav className="admin-tabs" aria-label="Rubriques du tableau de bord">
      {tabs.map(([id, label]) => <Link key={id} href={`/admin?tab=${id}`} aria-current={tab === id ? "page" : undefined}>
        {label}{id === "demandes" && fresh > 0 && <b className="admin-count">{fresh}</b>}
      </Link>)}
    </nav>
    <div className="admin-body">
      {ok && <p className="admin-alert is-ok" role="status">✓ {ok}</p>}
      {err && <p className="admin-alert is-err" role="alert">{err}</p>}

      {tab === "demandes" && <section>
        <h1>Demandes de rendez-vous</h1>
        <p className="admin-muted">Les demandes envoyées par le formulaire du site, la plus récente en premier.</p>
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
        <h1>Coordonnées du cabinet</h1>
        <p className="admin-muted">Affichées sur le site. Les demandes du formulaire sont envoyées à cette adresse e-mail et à ce numéro WhatsApp.</p>
        <form action={saveContact} className="admin-card admin-form">
          <label>Adresse e-mail<input name="email" type="email" required maxLength={254} defaultValue={content.contact.email} /></label>
          <label>Téléphone<input name="phone" type="tel" required pattern="[0-9 +().-]{8,30}" defaultValue={content.contact.phone} /></label>
          <label>Numéro WhatsApp<input name="whatsapp" type="tel" required pattern="[0-9 +().-]{8,30}" defaultValue={content.contact.whatsapp} /><small>Avec l’indicatif, par exemple +225 05 03 25 82 17.</small></label>
          <Submit className="admin-primary">Enregistrer</Submit>
        </form>
      </section>}

      {tab === "mediatheque" && <section>
        <h1>Médiathèque</h1>
        <p className="admin-muted">Publiez ou retirez les photos, vidéos et documents de la page Médiathèque.</p>
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
        <h1>Équipe</h1>
        <p className="admin-muted">Les membres affichés sur la page Nos équipes, dans cet ordre.</p>
        <form action={saveMember} className="admin-card admin-form admin-member-new">
          <h2>Ajouter un membre</h2>
          <label>Nom et prénom<input name="name" required maxLength={80} /></label>
          <label>Fonction<input name="role" required maxLength={120} placeholder="Ex. : Médiatrice — Gestion des plaintes" /></label>
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
              <label>{m.photo ? "Changer la photo" : "Ajouter une photo"}<input name="file" type="file" accept="image/jpeg,image/png,image/webp" /></label>
              <Submit className="admin-primary" pendingText="Envoi…">Enregistrer</Submit>
            </form>
            <form action={removeMember}><input type="hidden" name="id" value={m.id} /><Confirm message={`Retirer ${m.name} de l’équipe affichée sur le site ?`}>Retirer de l’équipe</Confirm></form>
          </article>)}</div>}
      </section>}

      {tab === "partenaires" && <section>
        <h1>Partenaires</h1>
        <p className="admin-muted">Les partenaires affichés dans la rubrique « Nos partenaires » de la page d’accueil, dans cet ordre. La rubrique n’apparaît que s’il y a au moins un partenaire.</p>
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
        <h1>Mon compte</h1>
        <p className="admin-muted">Identifiant : <b>{process.env.ADMIN_USER || "cams"}</b>. Changer le mot de passe déconnecte les autres appareils.</p>
        <form action={savePassword} className="admin-card admin-form">
          <label>Nouveau mot de passe<input name="password" type="password" required minLength={10} autoComplete="new-password" /><small>10 caractères au moins.</small></label>
          <label>Confirmer le mot de passe<input name="confirm" type="password" required minLength={10} autoComplete="new-password" /></label>
          <Submit className="admin-primary">Changer le mot de passe</Submit>
        </form>
      </section>}
    </div>
  </main>;
}
