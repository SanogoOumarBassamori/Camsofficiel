# Référencement Google du site CAMS

## Ce qui a été corrigé

| Problème trouvé | Correction |
|---|---|
| Aucun plan du site ni fichier pour les robots | `sitemap.xml` (accueil, équipe, médiathèque) et `robots.txt` (tableau de bord et formulaire exclus), générés automatiquement |
| Pas d’adresse canonique | Chaque page déclare son adresse officielle, ce qui évite les doublons |
| Titres peu ciblés (« Nos équipes — CAMS ») | Titres uniques avec l’activité et la ville, descriptions de 130 à 160 caractères |
| Aucun aperçu au partage (WhatsApp, Facebook, LinkedIn) | Image de partage 1200 × 630 et balises Open Graph et Twitter sur toutes les pages |
| Google ne savait pas qui est le cabinet | Fiche entreprise lisible par Google : nom, Abidjan, téléphone, e-mail, services, zone servie (Côte d’Ivoire), plus le fil d’Ariane sur les pages intérieures |
| Aucune réponse aux questions des clients | Section « Questions fréquentes » de 7 questions sur l’accueil, reprise dans les données Google |
| Polices chargées depuis Google en chaîne (bloquant l’affichage) | Polices hébergées par le site lui-même, avec une police de secours ajustée (texte affiché plus vite, sans saut de mise en page) |
| Ville peu présente dans les textes | « Abidjan » et « Côte d’Ivoire » intégrés naturellement dans l’accroche, la présentation et le pied de page |
| Fautes visibles | « Accompgnement », « NOTRE PUBLICS », « NOTRE ÉQUIPES », « vision,notre » corrigés |
| Page 404 indexable | Page 404 marquée « ne pas indexer » |

Déjà en place et vérifiés : une seule balise H1 par page, des textes alternatifs sur toutes les images, des images en WebP avec chargement différé, la compatibilité mobile, le HTTPS imposé et le tableau de bord exclu de Google.

## Mots-clés visés (à valider)

Ces expressions sont des **hypothèses** : aucun outil de volume de recherche n’a été utilisé. Elles sont à vérifier dans Search Console après quelques semaines (onglet « Performances »).

- **Principaux** : cabinet d’accompagnement social Abidjan · management social Côte d’Ivoire · accompagnement psychosocial Abidjan · cabinet de médiation Abidjan.
- **Secondaires** : gestion des plaintes, prévention des risques psychosociaux, formation et coaching en entreprise, cellule d’écoute en établissement scolaire, prévention des VBG, médiation familiale, nutritionniste ou diététicien à Abidjan.
- **Longue traîne** : « comment gérer un conflit au travail en Côte d’Ivoire », « mettre en place une cellule d’écoute dans une école », « accompagnement social pour ONG Abidjan », « médiation familiale Abidjan ».

Répartition par page :
- **Accueil** : cabinet d’accompagnement et de management social à Abidjan.
- **Équipe** : les pôles d’expertise (psychosocial, management, formation, nutrition).
- **Médiathèque** : ateliers, formations et ressources.

## À faire par le client ou le prestataire

1. **Adresse du site.** Sur Render, ajouter la variable `SITE_URL` avec l’adresse définitive (par exemple `https://www.cams-ci.com`), puis redéployer. Sans elle, le site se déclare sur `https://cams.onrender.com`. Un nom de domaine propre est fortement conseillé pour le référencement. Si un domaine est acheté, rediriger la version sans « www » vers la version avec « www » (ou l’inverse) depuis le fournisseur du domaine.
2. **Google Search Console** :
   1. Aller sur search.google.com/search-console et ajouter le site.
   2. Choisir la méthode « Balise HTML », copier seulement le code entre les guillemets de `content="…"`.
   3. Le mettre dans la variable `GOOGLE_SITE_VERIFICATION` sur Render, redéployer, puis cliquer sur « Valider ».
   4. Dans « Sitemaps », envoyer `sitemap.xml`.
   5. Dans « Inspection de l’URL », demander l’indexation de l’accueil, de `/equipe` et de `/mediatheque`.
3. **Google Business Profile** (le plus important pour les recherches locales) :
   1. Créer la fiche sur business.google.com avec exactement le même nom, téléphone et site que sur le site.
   2. Catégorie suggérée : « Consultant » ou « Service social ».
   3. Ajouter l’adresse du cabinet, les horaires et de vraies photos, puis demander des avis aux clients satisfaits (jamais de faux avis).
4. **Informations encore manquantes sur le site** :
   - L’adresse précise du cabinet (rue, commune) et les jours et horaires d’ouverture. Les transmettre pour les ajouter à la fiche Google du site.
   - Les liens vers les réseaux sociaux du cabinet.
5. **Contenus d’exemple** : remplacer les photos, vidéos, le document et les membres « Prénom Nom » par les vrais contenus via le tableau de bord. Google valorise les contenus réels et uniques.
6. **Google Analytics 4** (facultatif) : Search Console suffit pour suivre les clics et les positions. Si GA4 est voulu, il faudra :
   - un bandeau de consentement aux cookies ;
   - autoriser Google dans la politique de sécurité du site (fichier `next.config.ts`).
7. **Hébergement** : sur l’offre gratuite de Render, le site s’endort et met près d’une minute à se réveiller. Google peut alors abandonner l’exploration. Passer à l’offre payante améliore la vitesse et l’indexation.

## Points à savoir

- Google affiche désormais rarement les questions fréquentes en résultat enrichi. La section reste utile pour les visiteurs et pour la compréhension du site par Google.
- Le référencement prend généralement plusieurs semaines à plusieurs mois. Aucune position n’est garantie.

## Fichiers concernés

- **Nouveaux** :
  - `app/seo.ts` (adresse du site, titres, image de partage, fil d’Ariane)
  - `app/JsonLd.tsx`
  - `app/robots.ts`
  - `app/sitemap.ts`
  - `public/partage-cams.jpg`
- **Modifiés** :
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/equipe/page.tsx`
  - `app/mediatheque/page.tsx`
  - `app/not-found.tsx`
  - `app/admin/layout.tsx`
  - `app/SiteHeader.tsx`
  - `app/SiteFooter.tsx`
  - `app/site-config.ts`
  - les feuilles de style (polices et section FAQ)
  - `next.config.ts` (polices Google retirées de la politique de sécurité)
