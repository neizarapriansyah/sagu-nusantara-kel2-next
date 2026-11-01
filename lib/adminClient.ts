// pemanggil API admin dari browser. kalau sesi login sudah habis (401), langsung
// dilempar ke halaman login seperti SaguAuth.guard di versi UTS.
type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function adminFetch<T = unknown>(url: string, { method = "GET", body }: FetchOptions = {}): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && !url.endsWith("/login")) {
    window.location.replace("/admin/login");
    throw new Error("Sesi berakhir. Silakan masuk lagi.");
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((payload as { error?: string }).error ?? "Terjadi kesalahan, coba lagi.");
  return payload as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan, coba lagi.";
}
