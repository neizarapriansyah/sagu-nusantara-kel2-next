// GET /api/uploads/:name : melayani gambar yang diunggah dari dashboard (terbuka untuk umum,
// karena gambarnya tampil di website)
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { CONTENT_TYPES, SAFE_NAME, UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  if (!SAFE_NAME.test(name)) return new NextResponse("Not found", { status: 404 });

  try {
    const file = fs.readFileSync(path.join(UPLOAD_DIR, name));
    return new NextResponse(file, {
      headers: {
        "Content-Type": CONTENT_TYPES[name.split(".").pop() ?? ""] ?? "application/octet-stream",
        // nama file acak dan tidak pernah dipakai ulang, jadi aman di-cache lama
        "Cache-Control": "public, max-age=31536000, immutable",
        // SVG dari upload tidak boleh menjalankan script kalau dibuka langsung
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
