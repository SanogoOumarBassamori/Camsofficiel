# CAMS — site officiel

Règles générales : plugin vido (RULES.md), chargées à chaque session. Ce fichier ne garde que ce qui est propre au projet.
Stack : [.projetmemory/stack.md](.projetmemory/stack.md). État : [.projetmemory/state.md](.projetmemory/state.md). Décisions : [.projetmemory/decisions.md](.projetmemory/decisions.md).

<!-- Garder ce fichier sous 60 lignes : le détail va dans .projetmemory/. -->

## Commandes de vérification
- Lint : `npm run lint`
- Build + types : `npm run build`
- Dev : `npm run dev` (mobile sur le réseau local : `npm run dev:mobile`)

## Architecture (une phrase par composant)
- `app/` — pages, composants (SiteHeader, ContactForm…) et CSS du site, App Router.
- `app/site-config.ts` — coordonnées et contenus du site (dont l'e-mail destinataire du formulaire).
- `app/api/` — route `/api/contact` qui envoie les demandes par e-mail, clé côté serveur.
- `public/` — images statiques (logo).

## Règles propres au projet
- Configuration de l'envoi e-mail : voir [EMAIL_SETUP.md](EMAIL_SETUP.md) ; ne jamais exposer la clé côté client.
