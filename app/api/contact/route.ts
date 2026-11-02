import { addRequest, getContent, waNumber } from "../../_server/store";
import { appointment } from "../../site-config";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function field(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function frenchDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ error: "Requête refusée." }, 403);

  const length = Number(request.headers.get("content-length") || 0);
  if (length > 12_000) return json({ error: "Le formulaire est trop volumineux." }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Le formulaire est invalide." }, 400);
  }

  if (field(body, "website")) return json({ ok: true });

  const name = field(body, "name");
  const phone = field(body, "phone");
  const email = field(body, "email");
  const audience = field(body, "audience");
  const organization = field(body, "organization");
  const topic = field(body, "topic");
  const mode = field(body, "mode");
  const date = field(body, "date");
  const slot = field(body, "slot");
  const message = field(body, "message");

  if (name.length < 2 || name.length > 100) return json({ error: "Vérifiez le nom saisi." }, 400);
  if (!/^[0-9 +().-]{8,30}$/.test(phone)) return json({ error: "Vérifiez le numéro de téléphone." }, 400);
  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return json({ error: "Vérifiez l’adresse e-mail saisie." }, 400);
  if (!appointment.audiences.includes(audience)) return json({ error: "Sélectionnez votre profil." }, 400);
  if (organization.length > 120) return json({ error: "Le nom de la structure est trop long." }, 400);
  if (!appointment.topics.includes(topic)) return json({ error: "Choisissez un domaine." }, 400);
  if (!appointment.modes.includes(mode)) return json({ error: "Choisissez un type de rendez-vous." }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return json({ error: "Choisissez une date valide." }, 400);
  if (!appointment.slots.includes(slot)) return json({ error: "Choisissez un créneau." }, 400);
  if (message.length > 1000) return json({ error: "Le message est trop long." }, 400);
  if (field(body, "consent") !== "oui") return json({ error: "Merci d’accepter d’être recontacté." }, 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const previous = attempts.get(ip);
  if (previous && previous.resetAt > now && previous.count >= 5) return json({ error: "Trop de demandes. Réessayez dans quelques minutes." }, 429);
  if (!previous || previous.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
  else previous.count += 1;

  const rows: [string, string][] = [
    ["Nom", name],
    ["Téléphone / WhatsApp", phone],
    ["E-mail", email || "Non renseigné"],
    ["Profil", audience],
    ...(organization ? [["Structure", organization] as [string, string]] : []),
    ["Domaine", topic],
    ["Type de rendez-vous", mode],
    ["Date souhaitée", frenchDate(date)],
    ["Créneau", slot],
    ["Motif", message || "Non précisé"],
  ];
  // Chaque demande est gardée pour le tableau de bord, même si l’e-mail échoue.
  const channel = field(body, "channel") === "whatsapp" ? "whatsapp" : "email";
  let saved = true;
  try {
    await addRequest({ channel, name, phone, fields: rows });
  } catch (error) {
    console.error("CAMS request could not be saved", error instanceof Error ? error.message : "Unknown error");
    saved = false;
    if (channel === "whatsapp") return json({ error: "Demande non enregistrée." }, 500);
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (channel === "whatsapp" || (saved && (!apiKey || !from))) return json({ ok: true });
  if (!apiKey || !from) return json({ error: "La demande n’a pas pu être transmise. Utilisez WhatsApp." }, 503);

  const text = ["Nouvelle demande de rendez-vous reçue depuis le site CAMS.", "", ...rows.map(([k, v]) => `${k} : ${v}`)].join("\n");
  const whatsappLink = `https://wa.me/${waNumber(phone)}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#1f2622">
<h2 style="color:#165a37;margin:0 0 4px">Nouvelle demande de rendez-vous</h2>
<p style="color:#4b544e;margin:0 0 18px">Reçue depuis le site du CAMS.</p>
<table style="width:100%;border-collapse:collapse;font-size:15px">${rows.map(([k, v]) => `<tr><td style="padding:9px 12px;border-bottom:1px solid #e5dfd2;color:#8a6416;font-weight:bold;width:40%;vertical-align:top">${escapeHtml(k)}</td><td style="padding:9px 12px;border-bottom:1px solid #e5dfd2;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`).join("")}</table>
<p style="margin:20px 0 0"><a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}" style="background:#165a37;color:#fff;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Appeler</a>&nbsp;
<a href="${escapeHtml(whatsappLink)}" style="background:#25d366;color:#fff;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Répondre sur WhatsApp</a></p>
</div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [(await getContent()).contact.email],
        subject: `Rendez-vous : ${name} — ${topic}`,
        reply_to: email || undefined,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("Resend rejected a CAMS contact request", response.status);
      if (saved) return json({ ok: true });
      return json({ error: "L’e-mail n’a pas pu être envoyé. Réessayez ou utilisez WhatsApp." }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error("CAMS contact email request failed", error instanceof Error ? error.message : "Unknown error");
    if (saved) return json({ ok: true });
    return json({ error: "Le service e-mail est indisponible. Réessayez ou utilisez WhatsApp." }, 502);
  }
}
