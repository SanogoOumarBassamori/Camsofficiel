import "server-only";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readAdmin, writeAdmin } from "./store";

const scryptAsync = promisify(scrypt) as (password: string, salt: string, length: number) => Promise<Buffer>;
const COOKIE = "cams_admin";
const SESSION_DAYS = 7;

// Identifiant et mot de passe de départ dans les variables d’environnement ; le mot de passe changé depuis le tableau de bord est gardé haché.
export function authConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.SESSION_SECRET?.length ?? 0) >= 32);
}

const sign = (payload: string) => createHmac("sha256", process.env.SESSION_SECRET as string).update(payload).digest("hex");

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await scryptAsync(password, salt, 64)).toString("hex")}`;
}

export async function checkCredentials(username: string, password: string) {
  if (!authConfigured()) return false;
  const admin = await readAdmin();
  const userOk = sameText(username.trim().toLowerCase(), (process.env.ADMIN_USER || "cams").toLowerCase());
  let passOk: boolean;
  if (admin.hash) {
    const [salt, hash] = admin.hash.split(":");
    passOk = timingSafeEqual(await scryptAsync(password, salt, 64), Buffer.from(hash, "hex"));
  } else {
    passOk = sameText(sign(password), sign(process.env.ADMIN_PASSWORD as string));
  }
  return userOk && passOk;
}

// La version du mot de passe fait partie de la session : le changer déconnecte les autres appareils.
export async function openSession() {
  const { version } = await readAdmin();
  const payload = `${Date.now() + SESSION_DAYS * 86_400_000}.${version}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function closeSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!authConfigured()) return false;
  const [expires, version, signature] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  if (!signature || !sameText(signature, sign(`${expires}.${version}`)) || Number(expires) < Date.now()) return false;
  return Number(version) === (await readAdmin()).version;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/connexion");
}

export async function changePassword(password: string) {
  const { version } = await readAdmin();
  await writeAdmin({ hash: await hashPassword(password), version: version + 1 });
}
