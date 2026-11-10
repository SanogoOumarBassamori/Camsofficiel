// Copie une fois les données locales (data/) vers Supabase : contenus, demandes et fichiers envoyés.
// Lancer depuis la racine du projet : node --env-file=.env.local scripts/vers-supabase.mjs
// Le mot de passe du tableau de bord (admin.json) n'est pas copié : en ligne, c'est ADMIN_PASSWORD qui compte.
import { readdir, readFile } from "node:fs/promises";

const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("SUPABASE_URL et SUPABASE_SECRET_KEY manquent dans .env.local");
const auth = { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}) };
const types = { webp: "image/webp", pdf: "application/pdf" };

async function send(route, init) {
  const response = await fetch(url + route, { ...init, headers: { ...auth, ...init.headers } });
  if (!response.ok) throw new Error(`${route} : ${response.status} ${await response.text()}`);
}

for (const file of ["content.json", "requests.json"]) {
  const value = JSON.parse(await readFile(`data/${file}`, "utf8").catch(() => "null"));
  if (value === null) continue;
  await send("/rest/v1/cams_store", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key: file, value, updated_at: new Date().toISOString() }),
  });
  console.log("copié :", file);
}

const uploads = await readdir("data/uploads").catch(() => []);
for (const name of uploads.filter((n) => /^[a-f0-9]{24}\.(webp|pdf)$/.test(n))) {
  await send(`/storage/v1/object/cams-media/${name}`, {
    method: "POST",
    headers: { "Content-Type": types[name.split(".")[1]], "x-upsert": "true" },
    body: await readFile(`data/uploads/${name}`),
  });
}
console.log("fichiers copiés :", uploads.length);
