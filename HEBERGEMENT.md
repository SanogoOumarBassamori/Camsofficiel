# Mise en ligne gratuite : Netlify + Supabase + cams.ci

- **Netlify** fait tourner le site, gratuitement et avec le domaine cams.ci.
- **Supabase** garde ce que le tableau de bord modifie : contenus, demandes, photos et PDF.
- Une mise à jour du site n’efface donc plus rien.
- Sans les variables Supabase (essais en local), le site range tout dans le dossier `data/`, comme avant.

## 1. Supabase (une seule fois)

1. Sur supabase.com, créer un projet nommé `cams`, région **Europe (Frankfurt)**. Garder le mot de passe de base de données en lieu sûr ; le site n’en a pas besoin.
2. Menu **SQL Editor**, coller ce texte puis cliquer sur **Run** :

```sql
-- Contenus, demandes et réglages du site : une ligne par fichier, lisible seulement avec la clé secrète.
create table if not exists public.cams_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.cams_store enable row level security;
grant select, insert, update, delete on public.cams_store to service_role;

-- Photos et PDF envoyés depuis le tableau de bord (dossier privé, servi par le site).
insert into storage.buckets (id, name, public) values ('cams-media', 'cams-media', false)
on conflict (id) do nothing;
```

3. Menu **Project Settings → API Keys** :
   - noter l’adresse du projet (`https://….supabase.co`) ;
   - créer ou copier une **clé secrète** (`sb_secret_…`).
   - Cette clé donne tous les droits : elle ne va que dans `.env.local` et dans Netlify, jamais dans le code ni dans le chat.

## 2. Copier les données actuelles (une seule fois)

Dans `.env.local` (ignoré par Git), ajouter :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SECRET_KEY=sb_secret_…
```

Puis, à la racine du projet : `node --env-file=.env.local scripts/vers-supabase.mjs`

Le script copie les contenus, les demandes et les fichiers du dossier `data/`. À partir de là, `npm run dev` lit et écrit aussi dans Supabase : ce qui est modifié en local se voit en ligne.

## 3. Netlify

1. Sur app.netlify.com : **Add new project → Import an existing project → GitHub → Camsofficiel**. Les réglages sont lus dans `netlify.toml`.
2. Avant le premier déploiement, dans **Environment variables**, ajouter :
   - `SUPABASE_URL` et `SUPABASE_SECRET_KEY` (les mêmes qu’en local) ;
   - `ADMIN_USER` = `cams` et `ADMIN_PASSWORD` = le mot de passe du tableau de bord ;
   - `SESSION_SECRET` = une suite aléatoire d’au moins 32 caractères ;
   - `SITE_URL` = `https://cams.ci` ;
   - `GOOGLE_SCRIPT_URL` = l’adresse `/exec` du script Google (voir EMAIL_SETUP.md).
3. Lancer le déploiement. Chaque envoi sur GitHub redéploie ensuite le site.

Une petite tâche quotidienne (`netlify/functions/reveil-supabase.mjs`) lit Supabase une fois par jour : sans elle, l’offre gratuite se met en pause après 7 jours sans visite.

## 4. Brancher cams.ci

1. Netlify → **Domain management → Add a domain** → `cams.ci`. Netlify propose aussi `www.cams.ci`.
2. Chez Safaricloud, dans la zone DNS du domaine, créer :
   - un enregistrement **A** pour `cams.ci` vers `75.2.60.5` ;
   - un enregistrement **CNAME** pour `www` vers l’adresse `….netlify.app` du site.
3. Attendre la propagation (de quelques minutes à 24 h). Netlify active ensuite le HTTPS tout seul.

## Limites de l’offre gratuite

- **Netlify** : un quota mensuel de crédits. Chaque déploiement en consomme : mieux vaut regrouper les modifications avant d’envoyer sur GitHub. Si le quota est épuisé, le site est suspendu jusqu’au mois suivant.
- **Supabase** : 500 Mo de données et 1 Go de fichiers, largement assez pour ce site.
- Photos et PDF : 4 Mo au plus par fichier (limite d’envoi de Netlify).
