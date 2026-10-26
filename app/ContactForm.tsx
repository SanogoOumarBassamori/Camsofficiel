"use client";

import { FormEvent, useState } from "react";
import { siteConfig } from "./site-config";

function localToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel = submitter?.value || "email";
    const data = new FormData(form);
    setWhatsappUrl("");

    if (channel === "whatsapp") {
      const number = siteConfig.whatsappNumber.replace(/\D/g, "");
      if (number.length < 8 || number.length > 15) {
        setStatus("Le numéro WhatsApp du CAMS doit être configuré dans app/site-config.ts.");
        return;
      }
      const message = [
        "Bonjour CAMS, je souhaite demander un rendez-vous.",
        `Nom : ${data.get("name")}`,
        `Téléphone : ${data.get("phone")}`,
        `E-mail : ${data.get("email") || "Non renseigné"}`,
        `Profil : ${data.get("audience")}`,
        `Date souhaitée : ${data.get("date")}`,
        `Disponibilité : ${data.get("time")}`,
        `Motif : ${data.get("message") || "Non précisé"}`,
      ].join("\n");
      setWhatsappUrl(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
      setStatus("Votre message WhatsApp est prêt. Ouvrez WhatsApp puis appuyez sur Envoyer.");
      return;
    }

    setSending(true);
    setStatus("Envoi de votre demande…");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          audience: data.get("audience"),
          date: data.get("date"),
          time: data.get("time"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "L’envoi a échoué. Réessayez.");
      form.reset();
      setStatus("Votre demande a été envoyée au CAMS. Le rendez-vous sera confirmé par e-mail ou téléphone.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "L’envoi a échoué. Réessayez ou utilisez WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return <form className="request-form" onSubmit={handleSubmit}>
    <label>Nom et prénom<input name="name" autoComplete="name" required maxLength={100} placeholder="Votre nom" /></label>
    <label>Téléphone<input name="phone" type="tel" autoComplete="tel" required maxLength={30} placeholder="Votre numéro pour être recontacté" /></label>
    <label>E-mail (facultatif)<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="nom@exemple.com" /></label>
    <label>Vous êtes<select name="audience" required defaultValue=""><option value="" disabled>Sélectionnez votre profil</option><option>Un particulier ou une famille</option><option>Une entreprise ou organisation</option><option>Un établissement d’enseignement</option><option>Une ONG, association ou un projet</option><option>Une administration ou collectivité</option></select></label>
    <div className="form-date-row"><label>Date souhaitée<input name="date" type="date" min={localToday()} required /></label><label>Disponibilité<select name="time" required defaultValue=""><option value="" disabled>Choisir</option><option>Matin</option><option>Après-midi</option><option>Flexible</option></select></label></div>
    <label>Motif du rendez-vous (facultatif)<textarea name="message" maxLength={1000} rows={3} placeholder="Quelques mots pour orienter votre demande" /></label>
    <label className="form-honeypot" aria-hidden="true">Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <p className="form-note">Évitez d’indiquer des informations personnelles sensibles. Le CAMS confirmera le rendez-vous après réception.</p>
    <div className="form-actions">
      <button type="submit" name="channel" value="email" disabled={sending}>{sending ? "Envoi en cours…" : "Envoyer par e-mail"}</button>
      <button type="submit" name="channel" value="whatsapp" disabled={sending}>Continuer sur WhatsApp</button>
    </div>
    <p className="form-note" role="status" aria-live="polite">{status || "Choisissez un mode d’envoi. Le rendez-vous n’est pas confirmé avant la réponse du CAMS."}</p>
    {whatsappUrl && <a className="send-request whatsapp-request" href={whatsappUrl} target="_blank" rel="noreferrer">Ouvrir WhatsApp et envoyer ↗</a>}
  </form>;
}