import { mediaTypes, readUpload } from "../../_server/store";

export const runtime = "nodejs";

// Sert les photos et documents publiés depuis le tableau de bord.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const match = /^[a-f0-9]{24}\.(webp|pdf)$/.exec(file);
  if (!match) return new Response("Introuvable", { status: 404 });
  try {
    const body = await readUpload(file);
    return new Response(body, {
      headers: {
        "Content-Type": mediaTypes[match[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        // Chaque nom de fichier est unique : le réseau de l’hébergeur peut le garder en cache sans relancer le serveur.
        "CDN-Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
}
