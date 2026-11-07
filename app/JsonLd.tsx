// Données structurées lues par Google (fiche entreprise, FAQ, fil d’Ariane) ; « < » échappé pour ne jamais fermer la balise.
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
