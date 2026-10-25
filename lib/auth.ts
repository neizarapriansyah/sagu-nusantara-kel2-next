// login admin sederhana (port dari SaguAuth di data.js lama)
// catatan: ini hanya pengaman tampilan di sisi browser, bukan keamanan sungguhan,
// karena datanya memang disimpan di localStorage.

// ganti username / password admin di sini
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const SESSION_KEY = "webSagu_session";

export type Session = { user: string; at: string };

export const SaguAuth = {
  login(username: string, password: string): boolean {
    if (username !== ADMIN_USER || password !== ADMIN_PASS) return false;
    const session: Session = { user: username, at: new Date().toISOString() };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      return false;
    }
    return true;
  },

  session(): Session | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      const s = raw ? (JSON.parse(raw) as Session) : null;
      return s && s.user ? s : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* abaikan */
    }
  },
};
