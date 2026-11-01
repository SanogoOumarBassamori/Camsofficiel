export const siteConfig = {
  name: "CAMS",
  location: "Abidjan – Côte d’Ivoire",
  email: "sanogooumarbassamori@gmail.com",
  phone: "+225 07 69 50 53 23",
  whatsapp: "+225 07 69 50 53 23",
  // Format international, chiffres uniquement, sans + ni espaces.
  whatsappNumber: "2250503258217",
  socialLinks: [] as { label: string; href: string }[],
  // Médiathèque : ajouter ici les vraies photos (dans public/images), vidéos (lien YouTube) et documents (dans public/documents).
  mediatheque: {
    photos: [] as { src: string; alt: string; caption: string }[],
    videos: [] as { title: string; url: string }[],
    documents: [] as { title: string; href: string }[],
  },
  // Nos équipes : nom, fonction et photo (dans public/images) de chaque membre.
  team: [] as { name: string; role: string; photo?: string }[],
};

// Domaines d’intervention, avec une icône au même trait (24 × 24, contour) pour chacun.
export const services = [
  { title: "Accompagnement social", text: "Un espace d’écoute et des réponses adaptées aux situations individuelles, familiales et collectives.", img: "service-accompagnement", alt: "Deux femmes en conversation attentive", icon: ["M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"] },
  { title: "Management social", text: "Des démarches pour renforcer le fonctionnement humain et social des organisations.", img: "service-management", alt: "Équipe de professionnels en réunion de travail", icon: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6", "M17 11.5a2.5 2.5 0 1 0 0-5", "M17.5 14.2c2.2.6 3.5 2.8 3.5 5.8"] },
  { title: "Formation & coaching", text: "Le développement des compétences, des pratiques professionnelles et de l’autonomie.", img: "service-formation", alt: "Formatrice présentant un tableau lors d’une séance", icon: ["M2 9l10-5 10 5-10 5z", "M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5", "M22 9v6"] },
  { title: "Prévention & bien-être", text: "Prévention des risques psychosociaux, des conflits et des violences basées sur le genre.", img: "service-prevention", alt: "Groupe de femmes échangeant lors d’une rencontre", icon: ["M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z", "M8.5 12l2.5 2.5 4.5-5"] },
  { title: "Médiation & gestion des plaintes", text: "Des dispositifs d’écoute, d’orientation, de médiation et de gestion des situations sensibles.", img: "service-mediation", alt: "Deux hommes en discussion autour d’une table", icon: ["M3 6.5A2.5 2.5 0 0 1 5.5 4h8A2.5 2.5 0 0 1 16 6.5v4a2.5 2.5 0 0 1-2.5 2.5H8l-3.5 3V13A2.5 2.5 0 0 1 3 10.5z", "M19 9a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2V20l-3-2.5h-4a2 2 0 0 1-2-2"] },
  { title: "Nutrition & diététique", text: "Éducation nutritionnelle et accompagnement en diététique selon les besoins et le champ de compétence.", img: "service-nutrition-saine", alt: "Femme savourant un repas sain à base de fruits", icon: ["M12 7.5c-1.6-1.3-5.2-1.4-6.6 1.6-1.3 2.9-.4 7 2 9.3 1.4 1.3 3 1.1 4.6.4 1.6.7 3.2.9 4.6-.4 2.4-2.3 3.3-6.4 2-9.3-1.4-3-5-2.9-6.6-1.6z", "M12 7.5c0-2 1-3.6 3-4.5"] },
];  