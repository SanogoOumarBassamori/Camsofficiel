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
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [emailUrl, setEmailUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWhatsappUrl("");
    setEmailUrl("");
    const data = new FormData(event.currentTarget);
    const lines = [
      "Bonjour CAMS, je souhaite demander un rendez-vous.",
      `Nom : ${data.get("name")}`,
      `Téléphone : ${data.get("phone")}`,
      `E-mail du demandeur : ${data.get("email") || "Non renseigné"}`,
      `Profil : ${data.get("audience")}`,
      `Date souhaitée : ${data.get("date")}`,
      `Disponibilité : ${data.get("time")}`,
      `Motif : ${data.get("message") || "À préciser lors de l’échange"}`,
    ];
    const message = lines.join("\n");
    const number = siteConfig.whatsappNumber.replace(/\D/g, "");
    const validWhatsapp = number.length >= 8 && number.length <= 15;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siteConfig.email);

    if (validWhatsapp) setWhatsappUrl(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
    if (validEmail) {
      const subject = encodeURIComponent("Demande de rendez-vous - CAMS");
      setEmailUrl(`mailto:${siteConfig.email}?subject=${subject}&body=${encodeURIComponent(message)}`);
    }
    if (validWhatsapp || validEmail) {
      setStatus("Votre demande est prête. Choisissez WhatsApp ou e-mail, puis appuyez sur Envoyer dans l’application qui s’ouvre. Le CAMS confirmera le rendez-vous.");
    } else {
      setStatus("Les coordonnées WhatsApp et e-mail du CAMS doivent être renseignées dans app/site-config.ts avant l’envoi.");
    }
  }

  return <form className="request-form" onSubmit={handleSubmit}>
    <label>Nom et prénom<input name="name" autoComplete="name" required maxLength={100} placeholder="Votre nom" /></label>
    <label>Téléphone<input name="phone" type="tel" autoComplete="tel" required maxLength={30} placeholder="Votre numéro pour être recontacté" /></label>
    <label>E-mail (facultatif)<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="nom@exemple.com" /></label>
    <label>Vous êtes<select name="audience" required defaultValue=""><option value="" disabled>Sélectionnez votre profil</option><option>Un particulier ou une famille</option><option>Une entreprise ou organisation</option><option>Un établissement d’enseignement</option><option>Une ONG, association ou un projet</option><option>Une administration ou collectivité</option></select></label>
    <div className="form-date-row"><label>Date souhaitée<input name="date" type="date" min={localToday()} required /></label><label>Disponibilité<select name="time" required defaultValue=""><option value="" disabled>Choisir</option><option>Matin</option><option>Après-midi</option><option>Flexible</option></select></label></div>
    <label>Motif du rendez-vous (facultatif)<textarea name="message" maxLength={1000} rows={3} placeholder="Quelques mots pour orienter votre demande" /></label>
    <p className="form-note">Évitez d’indiquer des informations personnelles sensibles. Rien n’est envoyé sans votre action dans WhatsApp ou votre application e-mail.</p>
    <button type="submit">Préparer ma demande <span>↗</span></button>
    <p className="form-note" role="status">{status || "Le rendez-vous n’est confirmé qu’après la réponse du CAMS."}</p>
    {(whatsappUrl || emailUrl) && <div className="send-request-actions">
      {whatsappUrl && <a className="send-request whatsapp-request" href={whatsappUrl} target="_blank" rel="noreferrer">Envoyer par WhatsApp ↗</a>}
      {emailUrl && <a className="send-request email-request" href={emailUrl}>Envoyer par e-mail ↗</a>}
    </div>}
  </form>;
}