# Activer l’envoi e-mail du formulaire CAMS

Le formulaire envoie les demandes depuis `/api/contact` avec la clé conservée côté serveur. Le destinataire est `email` dans `app/site-config.ts`.

## Resend

1. Créez un compte Resend et ajoutez un domaine d’envoi que vous possédez.
2. Ajoutez chez le fournisseur DNS les enregistrements affichés par Resend, puis attendez la validation du domaine.
3. Dans Resend, créez une API key limitée à l’envoi d’e-mails.
4. Configurez `RESEND_API_KEY` et `RESEND_FROM_EMAIL` dans Vercel → projet CAMS → Settings → Environment Variables. `RESEND_FROM_EMAIL` doit utiliser le domaine validé, par exemple `CAMS <rendezvous@votre-domaine.ci>`.
5. Cochez Production (et Preview si nécessaire), enregistrez, puis redéployez.

Ne mettez jamais la clé dans `site-config.ts` ni dans une variable commençant par `NEXT_PUBLIC_`.

## Essai en local

Créez un fichier `.env.local` à la racine du projet (il est ignoré par Git) :

```env
RESEND_API_KEY=re_votre_cle
RESEND_FROM_EMAIL=CAMS <rendezvous@votre-domaine.ci>
```

Redémarrez `npm run dev:mobile` après avoir créé ou modifié ce fichier. Les variables ne sont pas nécessaires pour le build, mais l’envoi renverra un message de configuration manquante tant qu’elles ne sont pas définies.

Le bouton WhatsApp reste une alternative. L’envoi e-mail lui-même reste sur le site et affiche un message de confirmation ou d’erreur.