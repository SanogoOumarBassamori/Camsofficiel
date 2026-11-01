"use client";

import { FormEvent, useState } from "react";
import { appointment, siteConfig } from "./site-config";

type Status = { kind: "info" | "error"; text: string } | null;

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function frenchDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function isSunday(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 0;
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<"email" | "whatsapp" | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [audience, setAudience] = useState("");
  const isPerson = audience === appointment.audiences[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel = submitter?.value === "whatsapp" ? "whatsapp" : "email";
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (isSunday(data.date)) {
      setStatus({ kind: "error", text: "Le cabinet est fermé le dimanche : choisissez un autre jour." });
      return;
    }

    if (channel === "whatsapp") {
      const number = siteConfig.whatsappNumber.replace(/\D/g, "");
      const message = [
        "Bonjour CAMS, je souhaite prendre rendez-vous.",
        "",
        `• Nom : ${data.name}`,
        `• Téléphone : ${data.phone}`,
        data.email && `• E-mail : ${data.email}`,
        `• Profil : ${data.audience}`,
        data.organization && `• Structure : ${data.organization}`,
        `• Domaine : ${data.topic}`,
        `• Type de rendez-vous : ${data.mode}`,
        `• Date souhaitée : ${frenchDate(data.date)}, ${data.slot}`,
        data.message && `• Motif : ${data.message}`,
      ].filter(Boolean).join("\n");
      const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(url);
      setStatus(null);
      setSent("whatsapp");
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    setSending(true);
    setStatus({ kind: "info", text: "Envoi de votre demande…" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "L’envoi a échoué. Réessayez.");
      form.reset();
      setAudience("");
      setStatus(null);
      setSent("email");
    } catch (error) {
      setStatus({ kind: "error", text: error instanceof Error ? error.message : "L’envoi a échoué. Réessayez ou utilisez WhatsApp." });
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return <div className="form-success" role="status">
      <span className="form-success-icon" aria-hidden="true">✓</span>
      <h3>{sent === "email" ? "Demande envoyée" : "Votre message WhatsApp est prêt"}</h3>
      <p>{sent === "email"
        ? "Merci. Le CAMS a bien reçu votre demande et vous recontacte rapidement pour confirmer le rendez-vous."
        : "WhatsApp s’est ouvert avec votre demande déjà rédigée : il ne vous reste qu’à appuyer sur Envoyer."}</p>
      {sent === "whatsapp" && <a className="send-request whatsapp-request" href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp ne s’est pas ouvert ? Cliquez ici ↗</a>}
      <button type="button" className="form-reset" onClick={() => { setSent(null); setWhatsappUrl(""); }}>Faire une nouvelle demande</button>
    </div>;
  }

  return <form className="request-form" onSubmit={handleSubmit}>
    <fieldset>
      <legend><span>1</span> Vos coordonnées</legend>
      <label>Nom et prénom *<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Ex. : Aya Konan" /></label>
      <div className="form-date-row">
        <label>Téléphone / WhatsApp *<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={8} maxLength={30} pattern="[0-9 +().-]{8,30}" placeholder="Ex. : 07 00 00 00 00" /></label>
        <label>E-mail<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="nom@exemple.com" /></label>
      </div>
      <label>Vous êtes *<select name="audience" required value={audience} onChange={(e) => setAudience(e.target.value)}><option value="" disabled>Sélectionnez votre profil</option>{appointment.audiences.map((a) => <option key={a}>{a}</option>)}</select></label>
      {audience && !isPerson && <label>Nom de la structure<input name="organization" autoComplete="organization" maxLength={120} placeholder="Entreprise, école, ONG, administration…" /></label>}
    </fieldset>
    <fieldset>
      <legend><span>2</span> Votre demande</legend>
      <label>Domaine concerné *<select name="topic" required defaultValue=""><option value="" disabled>Choisissez un domaine</option>{appointment.topics.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Motif du rendez-vous<textarea name="message" maxLength={1000} rows={3} placeholder="Quelques mots pour nous aider à préparer l’échange (facultatif)" /></label>
    </fieldset>
    <fieldset>
      <legend><span>3</span> Le rendez-vous</legend>
      <label>Type de rendez-vous *<select name="mode" required defaultValue=""><option value="" disabled>Choisissez</option>{appointment.modes.map((m) => <option key={m}>{m}</option>)}</select></label>
      <div className="form-date-row">
        <label>Date souhaitée *<input name="date" type="date" min={localDate()} max={localDate(180)} required /></label>
        <label>Créneau *<select name="slot" required defaultValue=""><option value="" disabled>Choisissez</option>{appointment.slots.map((s) => <option key={s}>{s}</option>)}</select></label>
      </div>
    </fieldset>
    <label className="form-honeypot" aria-hidden="true">Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="form-consent"><input type="checkbox" name="consent" value="oui" required /><span>J’accepte que le CAMS utilise ces informations pour me recontacter. Elles restent confidentielles. *</span></label>
    <div className="form-actions">
      <button type="submit" name="channel" value="email" disabled={sending}>{sending ? "Envoi en cours…" : "Envoyer la demande"}</button>
      <button type="submit" name="channel" value="whatsapp" disabled={sending}>Envoyer via WhatsApp</button>
    </div>
    {status && <p className={`form-status is-${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>{status.text}</p>}
    <p className="form-note">* Champs obligatoires. Évitez les informations médicales ou sensibles : nous en parlerons lors du rendez-vous, qui n’est confirmé qu’après la réponse du CAMS.</p>
  </form>;
}
