# Recevoir les demandes du formulaire sur Gmail

Le formulaire enregistre chaque demande dans le tableau de bord, puis la transmet à un petit script Google. Ce script, créé dans le compte `cams.social26@gmail.com`, envoie l’e-mail depuis ce même compte. Il n’y a ni service payant ni clé d’API.

L’envoi passe par une adresse web Google (HTTPS) et non par le port e-mail du serveur. Il fonctionne donc aussi chez les hébergeurs qui bloquent l’envoi d’e-mails (offre gratuite de Render, beaucoup d’hébergements cPanel).

## 1. Créer le script (une seule fois)

1. Se connecter à Gmail avec `cams.social26@gmail.com`, puis ouvrir script.google.com et cliquer sur « Nouveau projet ».
2. Renommer le projet « Formulaire CAMS » (en haut à gauche).
3. Effacer tout le code affiché, coller celui-ci, puis cliquer sur l’icône Enregistrer :

```js
// Adresse qui reçoit les demandes du site.
var DESTINATAIRE = "cams.social26@gmail.com";

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var mail = { to: DESTINATAIRE, name: "Site CAMS", subject: String(d.subject).slice(0, 200), body: String(d.text), htmlBody: String(d.html) };
  if (d.replyTo) mail.replyTo = String(d.replyTo);
  MailApp.sendEmail(mail);
  return ContentService.createTextOutput("ok");
}

// À lancer une fois depuis l'éditeur : donne l'autorisation et envoie un e-mail d'essai.
function test() {
  doPost({ postData: { contents: JSON.stringify({ subject: "Essai du formulaire CAMS", text: "Ça marche.", html: "<p>Ça marche.</p>" }) } });
}
```

4. Dans la liste en haut, choisir `test`, puis cliquer sur « Exécuter ».
5. Google demande l’autorisation :
   1. Cliquer sur « Examiner les autorisations », puis choisir le compte cams.social26.
   2. Cliquer sur « Paramètres avancés », puis sur « Accéder à Formulaire CAMS (non sécurisé) ». C’est normal : le script est le vôtre.
   3. Cliquer sur « Autoriser ».
   4. Un e-mail « Essai du formulaire CAMS » arrive dans la boîte.
6. Cliquer sur « Déployer », puis « Nouveau déploiement ».
7. Cliquer sur la roue dentée, puis sur « Application Web », et régler :
   - Exécuter en tant que : **Moi** ;
   - Qui a accès : **Tout le monde**.
8. Cliquer sur « Déployer », puis copier l’**URL de l’application Web** (elle finit par `/exec`).

Cette adresse est secrète : elle ne doit jamais apparaître sur le site ni dans le code. Même si elle fuyait, le script n’envoie qu’à `DESTINATAIRE`.

## 2. Donner l’adresse au site

- **En local** : dans le fichier `.env.local` à la racine du projet (ignoré par Git), ajouter la ligne suivante, puis redémarrer `npm run dev` :
  ```env
  GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/…/exec
  ```
- **Sur Render** : ouvrir le service CAMS, puis Environment → Add Environment Variable. Nom : `GOOGLE_SCRIPT_URL`, valeur : l’adresse copiée. Enregistrer ; le site redémarre seul.
- **Chez Safaricloud** : même nom et même valeur dans les variables d’environnement de l’application Node.js.

Les anciennes variables `RESEND_API_KEY` et `RESEND_FROM_EMAIL` peuvent être supprimées.

## Bon à savoir

- **Changer d’adresse de réception** : modifier `DESTINATAIRE` dans le script, enregistrer, puis faire Déployer → Gérer les déploiements → crayon → Version : « Nouvelle version » → Déployer. L’adresse `/exec` reste la même.
- **Répondre au client** : le bouton « Répondre » de Gmail répond directement au client s’il a laissé son e-mail.
- **Limite Google** : 100 e-mails par jour avec un compte Gmail gratuit, largement suffisant pour un formulaire.
- **Si l’e-mail n’arrive pas** : la demande reste visible dans le tableau de bord (onglet Demandes) et le bouton WhatsApp reste disponible.
