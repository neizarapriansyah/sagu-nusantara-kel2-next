// POST /api/admin/login : cek username + password, kalau cocok pasang cookie sesi
import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, readJson } from "@/lib/adminApi";
import { SESSION_COOKIE, checkCredentials, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { logActivity } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const body = (await readJson(req)) as { username?: unknown; password?: unknown };
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!checkCredentials(username, password)) {
      throw new ApiError(401, "Username atau password salah. Periksa lagi, lalu coba masuk.");
    }

    await logActivity("Login", "Auth", `${username} masuk ke dashboard`);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, createSessionToken(username), sessionCookieOptions);
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
