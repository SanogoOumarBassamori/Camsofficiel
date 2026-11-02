# Tableau de bord du CAMS

Adresse : `/admin` (ex. https://cams.ci/admin). Le client y modifie les coordonnées, la médiathèque, l’équipe, les partenaires et consulte les demandes de rendez-vous (contrat, article 5).

## Variables d'environnement (serveur uniquement)
- `ADMIN_USER` : identifiant (par défaut `cams`).
- `ADMIN_PASSWORD` : mot de passe de départ, remis au client à la formation. Une fois changé depuis « Mon compte », c'est le nouveau qui compte.
- `SESSION_SECRET` : 64 caractères aléatoires (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- `CAMS_DATA_DIR` (facultatif) : dossier des données, `data/` par défaut.

## Hébergement
Les contenus et les demandes sont gardés dans le dossier `data/` du serveur (jamais sur GitHub). Il faut donc un hébergement Node.js avec disque persistant : VPS SafariCloud, ou offre mutualisée avec « Setup Node.js App ».
Mise en ligne : `npm ci && npm run build && npm start`. Sauvegarder régulièrement le dossier `data/`.
Sur Vercel, le site s'affiche avec les contenus par défaut mais le tableau de bord ne peut pas enregistrer (disque en lecture seule).

## Accès perdu
Supprimer `data/admin.json` sur le serveur : le mot de passe redevient `ADMIN_PASSWORD`.
