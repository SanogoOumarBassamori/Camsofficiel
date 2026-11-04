import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authConfigured, isAdmin, messageIsGenuine } from "../../_server/auth";
import { login } from "../actions";
import { Submit } from "../Buttons";

export default async function Connexion({ searchParams }: { searchParams: Promise<{ err?: string; s?: string; expired?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;
  const err = params.expired ? "Vous avez été déconnecté après 10 minutes d’inactivité." : messageIsGenuine(params.err, params.s) ? params.err : undefined;
  return <main className="admin-login">
    <form action={login} className="admin-card">
      <Image src="/logo-header.webp" alt="CAMS" width={640} height={597} priority />
      <h1>Tableau de bord</h1>
      <p className="admin-muted">Espace réservé au CAMS pour mettre à jour le site.</p>
      {!authConfigured() && <p className="admin-alert is-err" role="alert">L’accès n’est pas encore activé sur ce serveur. Contactez votre prestataire.</p>}
      {err && <p className="admin-alert is-err" role="alert">{err}</p>}
      <label>Identifiant<input name="username" autoComplete="username" required autoCapitalize="none" /></label>
      <label>Mot de passe<input name="password" type="password" autoComplete="current-password" required /></label>
      <Submit pendingText="Connexion…">Se connecter</Submit>
      <Link href="/" className="admin-link">← Retour au site</Link>
    </form>
  </main>;
}
