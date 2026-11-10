import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import sharp from "sharp";
import { siteConfig } from "../site-config";

// Données modifiables depuis le tableau de bord (jamais dans le dépôt) : en ligne dans Supabase (voir HEBERGEMENT.md),
// sinon sur le disque du serveur, dans data/.
const dataDir = path.resolve(process.env.CAMS_DATA_DIR || "data");
const uploadDir = path.join(dataDir, "uploads");
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const remote = Boolean(supabaseUrl && supabaseKey);
const bucket = "cams-media";
export const mediaTypes: Record<string, string> = { webp: "image/webp", pdf: "application/pdf" };

// Accès serveur à Supabase avec la clé secrète (jamais envoyée au navigateur) ; toute réponse en erreur lève une exception.
async function supabase(route: string, init: RequestInit = {}) {
  const key = supabaseKey as string;
  const response = await fetch(`${supabaseUrl}${route}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), ...init.headers },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  return response;
}

export type Photo = { id: string; src: string; alt: string; caption: string };
export type Video = { id: string; title: string; url: string };
export type Doc = { id: string; title: string; href: string };
export type Member = { id: string; name: string; role: string; bio?: string; photo?: string };
export type Partner = { id: string; name: string; url?: string; logo?: string };
export type Content = {
  contact: { email: string; phone: string; whatsapp: string };
  photos: Photo[];
  videos: Video[];
  documents: Doc[];
  team: Member[];
  partners: Partner[];
};
export type AppointmentRequest = {
  id: string;
  createdAt: string;
  channel: "email" | "whatsapp";
  status: "nouvelle" | "traitée";
  fields: [string, string][];
  name: string;
  phone: string;
};

export const newId = () => randomBytes(12).toString("hex");

function defaults(): Content {
  const m = siteConfig.mediatheque;
  return {
    contact: { email: siteConfig.email, phone: siteConfig.phone, whatsapp: siteConfig.whatsapp },
    photos: m.photos.map((p) => ({ id: newId(), ...p })),
    videos: m.videos.map((v) => ({ id: newId(), ...v })),
    documents: m.documents.map((d) => ({ id: newId(), ...d })),
    team: siteConfig.team.map((t) => ({ id: newId(), ...t })),
    partners: [],
  };
}

async function readJson<T>(file: string, fallback: () => T): Promise<T> {
  // Supabase injoignable : erreur plutôt que valeurs par défaut, qui écraseraient ensuite les vraies données.
  if (remote) {
    const rows = (await (await supabase(`/rest/v1/cams_store?key=eq.${file}&select=value`)).json()) as { value: T }[];
    return rows[0]?.value ?? fallback();
  }
  try {
    return JSON.parse(await readFile(path.join(dataDir, file), "utf8")) as T;
  } catch {
    return fallback();
  }
}

// Écriture atomique : un fichier temporaire puis un renommage, pour ne jamais laisser un JSON à moitié écrit.
async function writeJson(file: string, value: unknown) {
  if (remote) {
    await supabase("/rest/v1/cams_store", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key: file, value, updated_at: new Date().toISOString() }),
    });
    return;
  }
  await mkdir(dataDir, { recursive: true });
  const target = path.join(dataDir, file);
  const tmp = `${target}.${newId()}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, target);
}

// Les écritures passent une par une, pour qu'une demande reçue pendant une modification ne soit pas perdue.
// shortcut: en ligne, deux copies du site peuvent écrire au même instant ; très rare à ce trafic, sinon passer à une table par demande.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>) {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

// Les rubriques ajoutées après coup (ex. partenaires) reçoivent une liste vide dans les anciens fichiers.
async function readContent() {
  const content = await readJson<Content>("content.json", defaults);
  content.partners ??= [];
  return content;
}

export async function getContent() {
  await connection();
  return readContent();
}

export function updateContent(change: (c: Content) => void) {
  return serial(async () => {
    const content = await readContent();
    change(content);
    await writeJson("content.json", content);
  });
}

// Numéro au format international pour les liens WhatsApp (un numéro ivoirien à 10 chiffres reçoit l’indicatif 225).
export function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `225${digits}` : digits;
}

export function listRequests() {
  return readJson<AppointmentRequest[]>("requests.json", () => []);
}

export function addRequest(request: Omit<AppointmentRequest, "id" | "createdAt" | "status">) {
  return serial(async () => {
    const all = await listRequests();
    all.unshift({ id: newId(), createdAt: new Date().toISOString(), status: "nouvelle", ...request });
    await writeJson("requests.json", all.slice(0, 2000));
  });
}

export function updateRequests(change: (all: AppointmentRequest[]) => AppointmentRequest[]) {
  return serial(async () => writeJson("requests.json", change(await listRequests())));
}

export function readAdmin() {
  return readJson<{ hash?: string; version: number }>("admin.json", () => ({ version: 0 }));
}

export function writeAdmin(value: { hash?: string; version: number }) {
  return serial(() => writeJson("admin.json", value));
}

// Netlify refuse les envois de plus de 6 Mo environ (encodage compris) : 4 Mo laisse une marge sûre.
const maxUpload = 4 * 1024 * 1024;

// Les photos sont réencodées : taille réduite, métadonnées (lieu, appareil) retirées.
export async function saveImage(file: File, shape: "photo" | "square" | "logo" = "photo") {
  if (!file.size) throw new Error("Choisissez une photo.");
  if (file.size > maxUpload) throw new Error("La photo dépasse 4 Mo : réduisez-la ou faites une capture d’écran.");
  let output: Buffer;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 });
    // Seuls les vrais JPG, PNG et WebP passent : un SVG ou un autre format piégé est refusé.
    if (!["jpeg", "png", "webp"].includes((await image.metadata()).format ?? "")) throw new Error("format");
    image.rotate();
    const sized = shape === "square" ? image.resize(600, 600, { fit: "cover" })
      : shape === "logo" ? image.resize({ width: 480, height: 240, fit: "inside", withoutEnlargement: true })
      : image.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });
    output = await sized
      .webp({ quality: 80 }).toBuffer();
  } catch {
    throw new Error("Ce fichier n’est pas une photo valide (JPG, PNG ou WebP).");
  }
  return store(output, "webp");
}

export async function saveDocument(file: File) {
  if (!file.size) throw new Error("Choisissez un document.");
  if (file.size > maxUpload) throw new Error("Le document dépasse 4 Mo.");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("Seuls les documents PDF sont acceptés.");
  return store(buffer, "pdf");
}

// Les fichiers restent servis par /media/… dans les deux cas : adresses et politique de sécurité inchangées.
async function store(buffer: Buffer, ext: string) {
  const name = `${newId()}.${ext}`;
  if (remote) {
    await supabase(`/storage/v1/object/${bucket}/${name}`, { method: "POST", headers: { "Content-Type": mediaTypes[ext] }, body: new Uint8Array(buffer) });
  } else {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, name), buffer);
  }
  return `/media/${name}`;
}

export async function readUpload(name: string) {
  if (remote) return new Uint8Array(await (await supabase(`/storage/v1/object/${bucket}/${name}`)).arrayBuffer());
  return new Uint8Array(await readFile(path.join(uploadDir, name)));
}

export async function removeUpload(src?: string) {
  const name = src?.startsWith("/media/") ? path.basename(src) : "";
  if (!name) return;
  if (remote) await supabase(`/storage/v1/object/${bucket}/${name}`, { method: "DELETE" }).catch(() => undefined);
  else await unlink(path.join(uploadDir, name)).catch(() => undefined);
}
