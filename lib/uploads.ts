// Dikirim sebagai data URL lalu disimpan jadi file, dan
// database cukup menyimpan alamatnya (/api/uploads/nama-file).
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ApiError } from "@/lib/errors";

export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const UPLOAD_URL_PREFIX = "/api/uploads/";

const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(EXTENSIONS).map(([type, ext]) => [ext, type]),
);

// nama file yang boleh dilayani, mencegah akses ke folder lain lewat ../
export const SAFE_NAME = /^[a-f0-9-]{36}\.(png|jpg|webp|gif|svg)$/;

const DATA_URL = /^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=]+)$/;

export function isDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:");
}

// simpan satu data URL jadi file, balikannya alamat file untuk disimpan di database
export function saveDataUrl(dataUrl: string): string {
  const match = DATA_URL.exec(dataUrl);
  const ext = match ? EXTENSIONS[match[1]] : undefined;
  if (!match || !ext) throw new ApiError(400, "Format gambar tidak didukung.");

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_BYTES) throw new ApiError(400, "Ukuran gambar terlalu besar.");

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `${UPLOAD_URL_PREFIX}${name}`;
}

// ganti semua nilai data URL di sebuah objek dengan alamat file
export function persistImages<T extends Record<string, unknown>>(values: T): T {
  const result: Record<string, unknown> = { ...values };
  for (const [key, value] of Object.entries(result)) {
    if (isDataUrl(value)) result[key] = saveDataUrl(value);
  }
  return result as T;
}

// hapus semua file upload yang tidak disebut di teks "used" (dipanggil setelah import / reset,
// karena seluruh data diganti dan file lama jadi tidak terpakai)
export function pruneUploads(used: string) {
  let files: string[] = [];
  try {
    files = fs.readdirSync(UPLOAD_DIR);
  } catch {
    return; // folder belum ada, tidak ada yang perlu dihapus
  }
  for (const name of files) {
    if (SAFE_NAME.test(name) && !used.includes(name)) removeUpload(`${UPLOAD_URL_PREFIX}${name}`);
  }
}

// hapus file upload yang sudah tidak dipakai (gambar bawaan di /assets tidak disentuh)
export function removeUpload(url: unknown) {
  if (typeof url !== "string" || !url.startsWith(UPLOAD_URL_PREFIX)) return;
  const name = url.slice(UPLOAD_URL_PREFIX.length);
  if (!SAFE_NAME.test(name)) return;
  try {
    fs.unlinkSync(path.join(UPLOAD_DIR, name));
  } catch {
    // file sudah tidak ada, tidak masalah
  }
}
