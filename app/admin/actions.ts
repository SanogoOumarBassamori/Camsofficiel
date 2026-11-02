"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { changePassword, checkCredentials, closeSession, openSession, requireAdmin } from "../_server/auth";
import { newId, removeUpload, saveDocument, saveImage, updateContent, updateRequests } from "../_server/store";

const text = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const back = (tab: string, key: "ok" | "err", message: string): never => redirect(`/admin?tab=${tab}&${key}=${encodeURIComponent(message)}`);
const failure = (error: unknown) => (error instanceof Error && !("digest" in error) ? error.message : "");

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function login(form: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= 5) redirect("/admin/connexion?err=Trop de tentatives. Réessayez dans 15 minutes.");
  if (await checkCredentials(text(form, "username"), String(form.get("password") ?? ""))) {
    attempts.delete(ip);
    await openSession();
    redirect("/admin");
  }
  if (!entry || entry.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
  else entry.count += 1;
  redirect("/admin/connexion?err=Identifiant ou mot de passe incorrect.");
}

export async function logout() {
  await closeSession();
  redirect("/admin/connexion");
}

export async function saveContact(form: FormData) {
  await requireAdmin();
  const email = text(form, "email", 254);
  const phone = text(form, "phone", 30);
  const whatsapp = text(form, "whatsapp", 30);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back("coordonnees", "err", "Vérifiez l’adresse e-mail.");
  if (!/^[0-9 +().-]{8,30}$/.test(phone) || !/^[0-9 +().-]{8,30}$/.test(whatsapp)) back("coordonnees", "err", "Vérifiez les numéros de téléphone.");
  await updateContent((c) => { c.contact = { email, phone, whatsapp }; });
  back("coordonnees", "ok", "Coordonnées enregistrées.");
}

export async function addPhoto(form: FormData) {
  await requireAdmin();
  const caption = text(form, "caption", 120);
  if (!caption) back("mediatheque", "err", "Ajoutez une légende à la photo.");
  try {
    const src = await saveImage(form.get("file") as File);
    await updateContent((c) => { c.photos.unshift({ id: newId(), src, alt: caption, caption }); });
  } catch (error) {
    if (failure(error)) back("mediatheque", "err", failure(error));
    throw error;
  }
  back("mediatheque", "ok", "Photo publiée.");
}

export async function addVideo(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 120);
  const url = text(form, "url", 500);
  if (!title) back("mediatheque", "err", "Ajoutez un titre à la vidéo.");
  if (!/^https:\/\/\S+$/.test(url)) back("mediatheque", "err", "Collez le lien complet de la vidéo (il commence par https://).");
  await updateContent((c) => { c.videos.unshift({ id: newId(), title, url }); });
  back("mediatheque", "ok", "Vidéo publiée.");
}

export async function addDocument(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 120);
  if (!title) back("mediatheque", "err", "Ajoutez un titre au document.");
  try {
    const href = await saveDocument(form.get("file") as File);
    await updateContent((c) => { c.documents.unshift({ id: newId(), title, href }); });
  } catch (error) {
    if (failure(error)) back("mediatheque", "err", failure(error));
    throw error;
  }
  back("mediatheque", "ok", "Document publié.");
}

export async function removeMedia(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  let file: string | undefined;
  await updateContent((c) => {
    file = c.photos.find((p) => p.id === id)?.src ?? c.documents.find((d) => d.id === id)?.href;
    c.photos = c.photos.filter((p) => p.id !== id);
    c.videos = c.videos.filter((v) => v.id !== id);
    c.documents = c.documents.filter((d) => d.id !== id);
  });
  await removeUpload(file);
  back("mediatheque", "ok", "Élément retiré du site.");
}

export async function saveMember(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const name = text(form, "name", 80);
  const role = text(form, "role", 120);
  if (!name || !role) back("equipe", "err", "Indiquez le nom et la fonction.");
  const file = form.get("file") as File | null;
  let photo: string | undefined;
  try {
    if (file?.size) photo = await saveImage(file, "square");
  } catch (error) {
    if (failure(error)) back("equipe", "err", failure(error));
    throw error;
  }
  let old: string | undefined;
  await updateContent((c) => {
    const member = c.team.find((m) => m.id === id);
    if (!member) c.team.push({ id: newId(), name, role, photo });
    else {
      if (photo) { old = member.photo; member.photo = photo; }
      member.name = name;
      member.role = role;
    }
  });
  await removeUpload(old);
  back("equipe", "ok", id ? "Membre mis à jour." : "Membre ajouté.");
}

export async function removeMember(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  let photo: string | undefined;
  await updateContent((c) => {
    photo = c.team.find((m) => m.id === id)?.photo;
    c.team = c.team.filter((m) => m.id !== id);
  });
  await removeUpload(photo);
  back("equipe", "ok", "Membre retiré du site.");
}

export async function savePartner(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const name = text(form, "name", 100);
  const url = text(form, "url", 300);
  if (!name) back("partenaires", "err", "Indiquez le nom du partenaire.");
  if (url && !/^https?:\/\/\S+$/.test(url)) back("partenaires", "err", "Collez l’adresse complète du site (elle commence par https://).");
  const file = form.get("file") as File | null;
  let logo: string | undefined;
  try {
    if (file?.size) logo = await saveImage(file, "logo");
  } catch (error) {
    if (failure(error)) back("partenaires", "err", failure(error));
    throw error;
  }
  let old: string | undefined;
  await updateContent((c) => {
    const partner = c.partners.find((p) => p.id === id);
    if (!partner) c.partners.push({ id: newId(), name, url: url || undefined, logo });
    else {
      if (logo) { old = partner.logo; partner.logo = logo; }
      partner.name = name;
      partner.url = url || undefined;
    }
  });
  await removeUpload(old);
  back("partenaires", "ok", id ? "Partenaire mis à jour." : "Partenaire ajouté.");
}

export async function removePartner(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  let logo: string | undefined;
  await updateContent((c) => {
    logo = c.partners.find((p) => p.id === id)?.logo;
    c.partners = c.partners.filter((p) => p.id !== id);
  });
  await removeUpload(logo);
  back("partenaires", "ok", "Partenaire retiré du site.");
}

export async function setRequestStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const status = text(form, "status") === "traitée" ? "traitée" : "nouvelle";
  await updateRequests((all) => all.map((r) => (r.id === id ? { ...r, status } : r)));
  back("demandes", "ok", status === "traitée" ? "Demande marquée comme traitée." : "Demande remise en « nouvelle ».");
}

export async function removeRequest(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  await updateRequests((all) => all.filter((r) => r.id !== id));
  back("demandes", "ok", "Demande supprimée.");
}

export async function savePassword(form: FormData) {
  await requireAdmin();
  const password = String(form.get("password") ?? "");
  if (password.length < 10) back("compte", "err", "Le mot de passe doit contenir au moins 10 caractères.");
  if (password !== String(form.get("confirm") ?? "")) back("compte", "err", "Les deux mots de passe ne sont pas identiques.");
  await changePassword(password);
  await openSession();
  back("compte", "ok", "Mot de passe modifié. Les autres appareils sont déconnectés.");
}
