// semua query ke database ada di file ini (pengganti SaguStore + SaguLog di data.js UTS).
// komponen dan route API tidak boleh menulis SQL sendiri. saat pindah ke Prisma,
// cukup isi ulang fungsi-fungsi di sini dan sisanya tidak perlu diubah.
import { DEFAULT_DATA } from "@/data/defaultData";
import {
  COLLECTIONS,
  COLLECTION_KEYS,
  FOOD_OPTION_KEYS,
  SETTINGS_KEYS,
  cleanSettings,
  cleanValues,
  itemLabel,
  toList,
  type CollectionDef,
} from "@/lib/collections";
import { getDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { insertItem, replaceAllData } from "@/lib/seed";
import type {
  ActivityLog,
  AdminItem,
  CollectionKey,
  FoodOptionKey,
  FoodOptions,
  SaguData,
  Settings,
} from "@/lib/types";
import { isDataUrl, persistImages, pruneUploads, removeUpload } from "@/lib/uploads";
import { uid } from "@/lib/util";

const MAX_ACTIVITY = 30;

type Row = Record<string, unknown>;

function parseJsonList(value: unknown): string[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

// baris tabel (snake_case) jadi objek yang dipakai website (camelCase)
function rowToItem(def: CollectionDef, row: Row): AdminItem {
  const item: AdminItem = { id: String(row.id) };
  for (const f of def.fields) {
    const value = row[f.column];
    item[f.prop] = f.kind === "list" ? parseJsonList(value) : f.kind === "number" ? Number(value) || 0 : String(value ?? "");
  }
  return item;
}

export function getCollection(key: CollectionKey): AdminItem[] {
  const def = COLLECTIONS[key];
  const rows = getDb().prepare(`SELECT * FROM ${def.table} ORDER BY position, rowid`).all() as Row[];
  return rows.map((row) => rowToItem(def, row));
}

function getItem(key: CollectionKey, id: string): AdminItem | undefined {
  const def = COLLECTIONS[key];
  const row = getDb().prepare(`SELECT * FROM ${def.table} WHERE id = ?`).get(id) as Row | undefined;
  return row ? rowToItem(def, row) : undefined;
}

export function getFoodOptions(): FoodOptions {
  const rows = getDb().prepare("SELECT type, value FROM food_options ORDER BY position, id").all() as {
    type: FoodOptionKey;
    value: string;
  }[];
  const options: FoodOptions = { wilayah: [], kategori: [], penyajian: [] };
  for (const row of rows) options[row.type]?.push(row.value);
  return options;
}

export function getSettings(): Settings {
  const rows = getDb().prepare("SELECT key, value FROM site_settings").all() as { key: string; value: string }[];
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // pengaturan yang belum ada diisi data awal, sama seperti SaguStore.load() di UTS
  return { ...DEFAULT_DATA.settings, ...stored };
}

// seluruh data website, dipakai halaman utama dan dashboard
export function getSaguData(): SaguData {
  return {
    aboutCards: getCollection("aboutCards") as unknown as SaguData["aboutCards"],
    processingSteps: getCollection("processingSteps") as unknown as SaguData["processingSteps"],
    foods: getCollection("foods") as unknown as SaguData["foods"],
    foodOptions: getFoodOptions(),
    regions: getCollection("regions") as unknown as SaguData["regions"],
    facts: getCollection("facts") as unknown as SaguData["facts"],
    quizzes: getCollection("quizzes") as unknown as SaguData["quizzes"],
    settings: getSettings(),
  };
}

// riwayat aktivitas

export function logActivity(action: string, module: string, detail: string) {
  const db = getDb();
  db.prepare("INSERT INTO activity_log (action, module, detail, created_at) VALUES (?, ?, ?, ?)").run(
    action,
    module,
    detail,
    new Date().toISOString(),
  );
  // simpan 30 catatan terakhir saja
  db.prepare(
    "DELETE FROM activity_log WHERE id NOT IN (SELECT id FROM activity_log ORDER BY id DESC LIMIT ?)",
  ).run(MAX_ACTIVITY);
}

export function getActivity(limit = 8): ActivityLog[] {
  const rows = getDb()
    .prepare("SELECT id, action, module, detail, created_at FROM activity_log ORDER BY id DESC LIMIT ?")
    .all(limit) as { id: number; action: string; module: string; detail: string; created_at: string }[];
  return rows.map((r) => ({ id: r.id, action: r.action, module: r.module, detail: r.detail, time: r.created_at }));
}

export function clearActivity() {
  getDb().prepare("DELETE FROM activity_log").run();
}

// tambah, ubah, hapus, urutkan

export function createItem(key: CollectionKey, input: unknown): AdminItem {
  const def = COLLECTIONS[key];
  if (def.noAdd) throw new ApiError(403, "Menu ini tidak bisa menambah data.");

  const values = persistImages(cleanValues(key, input));
  const db = getDb();
  const item: AdminItem = { id: uid(def.prefix), ...values };

  const { next } = db.prepare(`SELECT COALESCE(MAX(position), -1) + 1 AS next FROM ${def.table}`).get() as { next: number };
  insertItem(db, def, item, next);

  logActivity("Tambah", def.title, `${itemLabel(item)} ditambahkan`);
  return item;
}

export function updateItem(key: CollectionKey, id: string, input: unknown): AdminItem {
  const def = COLLECTIONS[key];
  const old = getItem(key, id);
  if (!old) throw new ApiError(404, "Data ini sudah tidak ada, mungkin sudah dihapus.");

  const values = persistImages(cleanValues(key, input));
  const sets = def.fields.map((f) => `${f.column} = @${f.column}`).join(", ");
  const params: Row = { id };
  for (const f of def.fields) {
    params[f.column] = f.kind === "list" ? JSON.stringify(values[f.prop]) : values[f.prop];
  }
  getDb().prepare(`UPDATE ${def.table} SET ${sets} WHERE id = @id`).run(params);

  // gambar lama yang sudah diganti tidak perlu disimpan lagi
  for (const f of def.fields) {
    if (f.kind === "string" && old[f.prop] !== values[f.prop]) removeUpload(old[f.prop]);
  }

  const item: AdminItem = { ...old, ...values };
  logActivity("Ubah", def.title, `${itemLabel(item)} diperbarui`);
  return item;
}

export function deleteItem(key: CollectionKey, id: string) {
  const def = COLLECTIONS[key];
  if (def.noDelete) throw new ApiError(403, "Data di menu ini tidak bisa dihapus.");

  const old = getItem(key, id);
  if (!old) throw new ApiError(404, "Data ini sudah tidak ada, mungkin sudah dihapus.");

  getDb().prepare(`DELETE FROM ${def.table} WHERE id = ?`).run(id);
  for (const f of def.fields) removeUpload(old[f.prop]);
  logActivity("Hapus", def.title, `${itemLabel(old)} dihapus`);
}

// tukar posisi dengan data di atas / bawahnya (tombol naik / turun)
export function moveItem(key: CollectionKey, id: string, direction: "up" | "down"): AdminItem[] {
  const def = COLLECTIONS[key];
  if (!def.reorder) throw new ApiError(403, "Urutan menu ini tidak bisa diubah.");

  const db = getDb();
  const items = getCollection(key);
  const index = items.findIndex((x) => x.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return items;

  [items[index], items[target]] = [items[target], items[index]];
  const setPosition = db.prepare(`UPDATE ${def.table} SET position = ? WHERE id = ?`);
  db.transaction(() => items.forEach((item, position) => setPosition.run(position, item.id)))();

  logActivity("Urutkan", def.title, `${itemLabel(items[target])} dipindah ke posisi ${target + 1}`);
  return items;
}

// pengaturan website & opsi dropdown

export function updateSettings(input: unknown): Settings {
  const values = persistImages(cleanSettings(input)) as Partial<Settings>;
  const old = getSettings();
  const db = getDb();

  const save = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  db.transaction(() => {
    for (const { key } of SETTINGS_KEYS) save.run(key, values[key] ?? "");
  })();

  for (const { key } of SETTINGS_KEYS) {
    if (old[key] !== values[key]) removeUpload(old[key]);
  }

  logActivity("Ubah", "Pengaturan", "Pengaturan website diperbarui");
  return getSettings();
}

// tambah pilihan dropdown baru. kalau sudah ada (beda huruf besar kecil saja)
// pilihan lama yang dipakai, jadi tidak ada duplikat
export function addFoodOption(
  type: FoodOptionKey,
  input: unknown,
): { value: string; created: boolean; options: FoodOptions } {
  const text = String(input ?? "").trim().replace(/\s+/g, " ");
  if (!text) throw new ApiError(400, "Isian tidak boleh kosong.");

  const existing = getFoodOptions()[type].find((v) => v.toLowerCase() === text.toLowerCase());
  if (existing) return { value: existing, created: false, options: getFoodOptions() };

  const db = getDb();
  const { next } = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next FROM food_options WHERE type = ?").get(type) as { next: number };
  db.prepare("INSERT INTO food_options (type, value, position) VALUES (?, ?, ?)").run(type, text, next);

  const label = type === "penyajian" ? "jenis penyajian" : type;
  logActivity("Tambah", "Kuliner Sagu", `Opsi ${label} "${text}" ditambahkan`);
  return { value: text, created: true, options: getFoodOptions() };
}

// export, import, reset

function angkaAwal(teks: string): number {
  let total = 0;
  for (const huruf of teks) total += huruf.charCodeAt(0);
  return (total % 10) + 1;
}

// merapikan file JSON dari export (bisa juga dari versi UTS) sebelum ditulis ke database
function normalizeImport(raw: unknown): SaguData {
  if (!raw || typeof raw !== "object") throw new ApiError(400, "Format JSON tidak valid.");
  const source = raw as Record<string, unknown>;

  const missing = COLLECTION_KEYS.filter((k) => !Array.isArray(source[k]));
  if (missing.length === COLLECTION_KEYS.length) {
    throw new ApiError(400, "File tidak berisi data Sagu Nusantara (aboutCards, foods, dst).");
  }

  const data = {} as Record<string, unknown>;
  for (const key of COLLECTION_KEYS) {
    const def = COLLECTIONS[key];
    // bagian yang hilang diisi data awal
    const list = Array.isArray(source[key]) ? (source[key] as Row[]) : (DEFAULT_DATA[key] as unknown as Row[]);

    data[key] = list.map((entry) => {
      const item: Row = { id: typeof entry.id === "string" && entry.id ? entry.id : uid(def.prefix) };
      for (const f of def.fields) {
        const value = entry[f.prop];
        if (f.kind === "list") item[f.prop] = toList(value);
        else if (f.kind === "number") {
          item[f.prop] = typeof value === "number" ? value : angkaAwal(String(item.id) + (f.prop === "likes" ? "suka" : "ga"));
        } else {
          const text = String(value ?? "");
          // gambar data URL dari export lama disimpan jadi file
          item[f.prop] = isDataUrl(text) ? persistImages({ v: text }).v : text;
        }
      }
      return item;
    });
  }

  const options = (source.foodOptions ?? {}) as Record<string, unknown>;
  data.foodOptions = Object.fromEntries(
    FOOD_OPTION_KEYS.map((k) => [k, Array.isArray(options[k]) ? toList(options[k]) : DEFAULT_DATA.foodOptions[k]]),
  );

  const settings = { ...DEFAULT_DATA.settings, ...((source.settings as object) ?? {}) } as Settings;
  data.settings = persistImages(
    Object.fromEntries(SETTINGS_KEYS.map(({ key }) => [key, String(settings[key] ?? "")])),
  );

  return data as unknown as SaguData;
}

export function exportData(): SaguData {
  logActivity("Export", "Data", "Seluruh konten diekspor ke JSON");
  return getSaguData();
}

export function importData(raw: unknown, fileName: string): SaguData {
  // normalizeImport dijalankan dulu: file JSON yang rusak ditolak sebelum data lama disentuh
  replaceAllData(getDb(), normalizeImport(raw));
  const data = getSaguData();
  pruneUploads(JSON.stringify(data));
  logActivity("Import", "Data", `Konten diimpor dari ${fileName}`);
  return data;
}

export function resetData(): SaguData {
  replaceAllData(getDb(), DEFAULT_DATA);
  const data = getSaguData();
  pruneUploads(JSON.stringify(data));
  logActivity("Reset", "Database", "Data dikembalikan ke kondisi awal");
  return data;
}
