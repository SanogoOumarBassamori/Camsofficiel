import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "../../_server/store";

export const runtime = "nodejs";

const types: Record<string, string> = { webp: "image/webp", pdf: "application/pdf" };

// Sert les photos et documents publiés depuis le tableau de bord.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const match = /^[a-f0-9]{24}\.(webp|pdf)$/.exec(file);
  if (!match) return new Response("Introuvable", { status: 404 });
  try {
    const body = await readFile(path.join(uploadDir, file));
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": types[match[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
}
