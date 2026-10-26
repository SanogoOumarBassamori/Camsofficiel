import { siteConfig } from "../../site-config";

export const runtime = "nodejs";

const allowedAudiences = new Set([
  "Un particulier ou une famille",
  "Une entreprise ou organisation",
  "Un établissement d’enseignement",
  "Une ONG, association ou un projet",
  "Une administration ou collectivité",
]);
const attempts = new Map<string, { count: number; resetAt: number }>();

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ error: "Requête refusée." }, 403);

  const length = Number(request.headers.get("content-length") || 0);
  if (length > 12_000) return json({ error: "Le formulaire est trop volumineux." }, 413);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return json({ error: "L’envoi e-mail n’est pas encore configuré." }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Le formulaire est invalide." }, 400);
  }

  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const audience = typeof body.audience === "string" ? body.audience : "";
  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2 || name.length > 100) return json({ error: "Vérifiez le nom saisi." }, 400);
  if (phone.length < 5 || phone.length > 30) return json({ error: "Vérifiez le numéro de téléphone." }, 400);
  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return json({ error: "Vérifiez l’adresse e-mail saisie." }, 400);
  if (!allowedAudiences.has(audience)) return json({ error: "Sélectionnez votre profil." }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "Choisissez une date valide." }, 400);
  if (!["Matin", "Après-midi", "Flexible"].includes(time)) return json({ error: "Choisissez une disponibilité." }, 400);
  if (message.length > 1000) return json({ error: "Le message est trop long." }, 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const previous = attempts.get(ip);
  if (previous && previous.resetAt > now && previous.count >= 5) return json({ error: "Trop de demandes. Réessayez dans quelques minutes." }, 429);
  if (!previous || previous.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
  else previous.count += 1;

  const text = [
    "Nouvelle demande de rendez-vous reçue depuis le site CAMS.",
    "",
    `Nom : ${name}`,
    `Téléphone : ${phone}`,
    `E-mail : ${email || "Non renseigné"}`,
    `Profil : ${audience}`,
    `Date souhaitée : ${date}`,
    `Disponibilité : ${time}`,
    `Motif : ${message || "Non précisé"}`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [siteConfig.email],
        subject: "Demande de rendez-vous - CAMS",
        reply_to: email || undefined,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("Resend rejected a CAMS contact request", response.status);
      return json({ error: "L’e-mail n’a pas pu être envoyé. Réessayez ou utilisez WhatsApp." }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error("CAMS contact email request failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Le service e-mail est indisponible. Réessayez ou utilisez WhatsApp." }, 502);
  }
}