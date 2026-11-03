import { touchSession } from "../../_server/auth";

export const runtime = "nodejs";

// Prolonge la session quand l’administrateur est actif ; répond 401 si elle a déjà expiré.
export async function POST() {
  return new Response(null, { status: (await touchSession()) ? 204 : 401 });
}
