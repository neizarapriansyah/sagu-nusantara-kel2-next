// pembungkus route API admin: cek login dulu, lalu ubah hasil / error jadi respons JSON
import { NextResponse, type NextRequest } from "next/server";
import { getSession, type Session } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

type Params = Record<string, string>;

type Handler = (req: NextRequest, params: Params, session: Session) => unknown | Promise<unknown>;

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
}

// route yang dibungkus ini hanya bisa dipakai admin yang sudah login (401 kalau belum)
export function adminRoute(handler: Handler) {
  return async (req: NextRequest, ctx: { params: Promise<Params> }) => {
    try {
      const session = await getSession();
      if (!session) throw new ApiError(401, "Sesi berakhir. Silakan masuk lagi.");

      const result = await handler(req, await ctx.params, session);
      return result instanceof Response ? result : NextResponse.json(result ?? { ok: true });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

// isi body JSON, 400 kalau bukan JSON
export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Data yang dikirim bukan JSON yang valid.");
  }
}
