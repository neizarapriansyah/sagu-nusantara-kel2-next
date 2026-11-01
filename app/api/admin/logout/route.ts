// POST /api/admin/logout : hapus cookie sesi
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSession } from "@/lib/auth";
import { logActivity } from "@/lib/repository";

export async function POST() {
  const session = await getSession();
  if (session) await logActivity("Logout", "Auth", `${session.user} keluar dari dashboard`);

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
