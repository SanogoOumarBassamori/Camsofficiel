import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import sharp from "sharp";
import { siteConfig } from "../site-config";

// Données modifiables depuis le tableau de bord, gardées sur le disque du serveur (jamais dans le dépôt).
export const dataDir = path.resolve(process.env.CAMS_DATA_DIR || "data");
export const uploadDir = path.join(dataDir, "uploads");

export type Photo = { id: string; src: string; alt: string; caption: string };
export type Video = { id: string; title: string; url: string };
export type Doc = { id: string; title: string; href: string };
export type Member = { id: string; name: string; role: string; photo?: string };
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
  try {
    return JSON.parse(await readFile(path.join(dataDir, file), "utf8")) as T;
  } catch {
    return fallback();
  }
}

// Écriture atomique : un fichier temporaire puis un renommage, pour ne jamais laisser un JSON à moitié écrit.
async function writeJson(file: string, value: unknown) {
  await mkdir(dataDir, { recursive: true });
  const target = path.join(dataDir, file);
  const tmp = `${target}.${newId()}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await rename(tmp, target);
}

// Les écritures passent une par une, pour qu'une demande reçue pendant une modification ne soit pas perdue.
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

const MB = 1024 * 1024;

// Les photos sont réencodées : taille réduite, métadonnées (lieu, appareil) retirées.
export async function saveImage(file: File, shape: "photo" | "square" | "logo" = "photo") {
  if (!file.size) throw new Error("Choisissez une photo.");
  if (file.size > 8 * MB) throw new Error("La photo dépasse 8 Mo.");
  let output: Buffer;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 }).rotate();
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
  if (file.size > 10 * MB) throw new Error("Le document dépasse 10 Mo.");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("Seuls les documents PDF sont acceptés.");
  return store(buffer, "pdf");
}

async function store(buffer: Buffer, ext: string) {
  await mkdir(uploadDir, { recursive: true });
  const name = `${newId()}.${ext}`;
  await writeFile(path.join(uploadDir, name), buffer);
  return `/media/${name}`;
}

export async function removeUpload(src?: string) {
  const name = src?.startsWith("/media/") ? path.basename(src) : "";
  if (name) await unlink(path.join(uploadDir, name)).catch(() => undefined);
}
