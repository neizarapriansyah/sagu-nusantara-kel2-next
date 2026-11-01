// login admin dengan cookie sesi (pengganti SaguAuth di data.js UTS yang hanya simulasi di browser).
// cookie berisi nama user + waktu kedaluwarsa dan ditandatangani HMAC, jadi tidak bisa dipalsukan
// tanpa SESSION_SECRET. cookie httpOnly sehingga tidak terbaca oleh JavaScript di browser.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sagu_session";
export const SESSION_HOURS = 8;

export type Session = { user: string; expiresAt: number };

// nilai bawaan sama dengan versi UTS (admin / sagu123), ganti lewat .env saat deploy
function credentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "sagu123",
  };
}

function secret(): string {
  return process.env.SESSION_SECRET ?? "sagu-nusantara-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

// bandingkan lewat hash supaya panjang teks tidak bocor dari lama waktu pengecekan
function sameText(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function checkCredentials(username: string, password: string): boolean {
  const valid = credentials();
  // dua-duanya selalu dicek supaya tidak ketahuan mana yang salah
  const userOk = sameText(username, valid.username);
  const passOk = sameText(password, valid.password);
  return userOk && passOk;
}

export function createSessionToken(user: string): string {
  const session: Session = { user, expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000 };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !sameText(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return Date.now() > session.expiresAt ? null : session;
  } catch {
    return null;
  }
}

// sesi admin yang sedang login, null kalau belum login atau sudah kedaluwarsa
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return readToken(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
};
