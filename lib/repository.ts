// semua query ke database ada di file ini (pengganti SaguStore + SaguLog di data.js UTS).
// komponen dan route API tidak boleh memanggil Prisma langsung, semuanya lewat fungsi di sini.
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
} from "@/lib/collections";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { replaceAllData } from "@/lib/seed";
import type { ActivityLog, AdminItem, CollectionKey, FoodOptionKey, FoodOptions, SaguData, Settings } from "@/lib/types";
import { isDataUrl, persistImages, pruneUploads, removeUpload } from "@/lib/uploads";
import { uid } from "@/lib/util";

const MAX_ACTIVITY = 30;

type Row = Record<string, unknown>;

// model Prisma dipilih lewat nama di COLLECTIONS, jadi satu set fungsi dipakai untuk semua koleksi
type Delegate = {
  findMany(args?: unknown): Promise<Row[]>;
  findUnique(args: unknown): Promise<Row | null>;
  create(args: unknown): Promise<Row>;
  update(args: unknown): Promise<Row>;
  delete(args: unknown): Promise<Row>;
  aggregate(args: unknown): Promise<{ _max: { position: number | null } }>;
};

function delegate(key: CollectionKey): Delegate {
  return (prisma as unknown as Record<string, Delegate>)[COLLECTIONS[key].model];
}

// baris dari database jadi objek yang dipakai website (hanya field yang dikenal, tanpa kolom position)
function rowToItem(key: CollectionKey, row: Row): AdminItem {
  const item: AdminItem = { id: String(row.id) };
  for (const f of COLLECTIONS[key].fields) {
    const value = row[f.prop];
    item[f.prop] = f.kind === "list" ? toList(value) : f.kind === "number" ? Number(value) || 0 : String(value ?? "");
  }
  return item;
}

// seed awal: dijalankan sekali saat database masih kosong (dan lewat `npx prisma db seed`)
export async function ensureSeeded() {
  const seeded = await prisma.appMeta.findUnique({ where: { key: "seeded" } });
  if (seeded) return;
  await replaceAllData(DEFAULT_DATA);
  await prisma.appMeta.upsert({ where: { key: "seeded" }, update: {}, create: { key: "seeded", value: "1" } });
}

export async function getCollection(key: CollectionKey): Promise<AdminItem[]> {
  const rows = await delegate(key).findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  return rows.map((row) => rowToItem(key, row));
}

async function getItem(key: CollectionKey, id: string): Promise<AdminItem | undefined> {
  const row = await delegate(key).findUnique({ where: { id } });
  return row ? rowToItem(key, row) : undefined;
}

export async function getFoodOptions(): Promise<FoodOptions> {
  const rows = await prisma.foodOption.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  const options: FoodOptions = { wilayah: [], kategori: [], penyajian: [] };
  for (const row of rows) options[row.type as FoodOptionKey]?.push(row.value);
  return options;
}

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.siteSetting.findMany();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // pengaturan yang belum ada diisi data awal, sama seperti SaguStore.load() di UTS
  return { ...DEFAULT_DATA.settings, ...stored };
}

// seluruh data website, dipakai halaman utama dan dashboard
export async function getSaguData(): Promise<SaguData> {
  await ensureSeeded();
  const [aboutCards, processingSteps, foods, regions, facts, quizzes, foodOptions, settings] = await Promise.all([
    getCollection("aboutCards"),
    getCollection("processingSteps"),
    getCollection("foods"),
    getCollection("regions"),
    getCollection("facts"),
    getCollection("quizzes"),
    getFoodOptions(),
    getSettings(),
  ]);

  return {
    aboutCards: aboutCards as unknown as SaguData["aboutCards"],
    processingSteps: processingSteps as unknown as SaguData["processingSteps"],
    foods: foods as unknown as SaguData["foods"],
    foodOptions,
    regions: regions as unknown as SaguData["regions"],
    facts: facts as unknown as SaguData["facts"],
    quizzes: quizzes as unknown as SaguData["quizzes"],
    settings,
  };
}

// riwayat aktivitas

export async function logActivity(action: string, module: string, detail: string) {
  await prisma.activityLog.create({ data: { action, module, detail } });

  // simpan 30 catatan terakhir saja
  const keep = await prisma.activityLog.findMany({ orderBy: { id: "desc" }, take: MAX_ACTIVITY, select: { id: true } });
  await prisma.activityLog.deleteMany({ where: { id: { notIn: keep.map((r) => r.id) } } });
}

export async function getActivity(limit = 8): Promise<ActivityLog[]> {
  const rows = await prisma.activityLog.findMany({ orderBy: { id: "desc" }, take: limit });
  return rows.map((r) => ({ id: r.id, action: r.action, module: r.module, detail: r.detail, time: r.createdAt.toISOString() }));
}

export async function clearActivity() {
  await prisma.activityLog.deleteMany();
}

// tambah, ubah, hapus, urutkan

export async function createItem(key: CollectionKey, input: unknown): Promise<AdminItem> {
  const def = COLLECTIONS[key];
  if (def.noAdd) throw new ApiError(403, "Menu ini tidak bisa menambah data.");

  const values = persistImages(cleanValues(key, input));
  const { _max } = await delegate(key).aggregate({ _max: { position: true } });
  const item: AdminItem = { id: uid(def.prefix), ...values };

  await delegate(key).create({ data: { ...item, position: (_max.position ?? -1) + 1 } });

  await logActivity("Tambah", def.title, `${itemLabel(item)} ditambahkan`);
  return item;
}

export async function updateItem(key: CollectionKey, id: string, input: unknown): Promise<AdminItem> {
  const def = COLLECTIONS[key];
  const old = await getItem(key, id);
  if (!old) throw new ApiError(404, "Data ini sudah tidak ada, mungkin sudah dihapus.");

  const values = persistImages(cleanValues(key, input));
  await delegate(key).update({ where: { id }, data: values });

  // gambar lama yang sudah diganti tidak perlu disimpan lagi
  for (const f of def.fields) {
    if (f.kind === "string" && old[f.prop] !== values[f.prop]) removeUpload(old[f.prop]);
  }

  const item: AdminItem = { ...old, ...values };
  await logActivity("Ubah", def.title, `${itemLabel(item)} diperbarui`);
  return item;
}

export async function deleteItem(key: CollectionKey, id: string) {
  const def = COLLECTIONS[key];
  if (def.noDelete) throw new ApiError(403, "Data di menu ini tidak bisa dihapus.");

  const old = await getItem(key, id);
  if (!old) throw new ApiError(404, "Data ini sudah tidak ada, mungkin sudah dihapus.");

  await delegate(key).delete({ where: { id } });
  for (const f of def.fields) removeUpload(old[f.prop]);
  await logActivity("Hapus", def.title, `${itemLabel(old)} dihapus`);
}

// tukar posisi dengan data di atas / bawahnya (tombol naik / turun)
export async function moveItem(key: CollectionKey, id: string, direction: "up" | "down"): Promise<AdminItem[]> {
  const def = COLLECTIONS[key];
  if (!def.reorder) throw new ApiError(403, "Urutan menu ini tidak bisa diubah.");

  const items = await getCollection(key);
  const index = items.findIndex((x) => x.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return items;

  [items[index], items[target]] = [items[target], items[index]];
  await prisma.$transaction(
    items.map((item, position) => delegate(key).update({ where: { id: item.id }, data: { position } }) as never),
  );

  await logActivity("Urutkan", def.title, `${itemLabel(items[target])} dipindah ke posisi ${target + 1}`);
  return items;
}

// pengaturan website & opsi dropdown

export async function updateSettings(input: unknown): Promise<Settings> {
  const values = persistImages(cleanSettings(input)) as Partial<Settings>;
  const old = await getSettings();

  await prisma.$transaction(
    SETTINGS_KEYS.map(({ key }) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: values[key] ?? "" },
        create: { key, value: values[key] ?? "" },
      }),
    ),
  );

  for (const { key } of SETTINGS_KEYS) {
    if (old[key] !== values[key]) removeUpload(old[key]);
  }

  await logActivity("Ubah", "Pengaturan", "Pengaturan website diperbarui");
  return getSettings();
}

// tambah pilihan dropdown baru. kalau sudah ada (beda huruf besar kecil saja)
// pilihan lama yang dipakai, jadi tidak ada duplikat
export async function addFoodOption(
  type: FoodOptionKey,
  input: unknown,
): Promise<{ value: string; created: boolean; options: FoodOptions }> {
  const text = String(input ?? "").trim().replace(/\s+/g, " ");
  if (!text) throw new ApiError(400, "Isian tidak boleh kosong.");

  const existing = (await getFoodOptions())[type].find((v) => v.toLowerCase() === text.toLowerCase());
  if (existing) return { value: existing, created: false, options: await getFoodOptions() };

  const { _max } = await prisma.foodOption.aggregate({ where: { type }, _max: { position: true } });
  await prisma.foodOption.create({ data: { type, value: text, position: (_max.position ?? -1) + 1 } });

  const label = type === "penyajian" ? "jenis penyajian" : type;
  await logActivity("Tambah", "Kuliner Sagu", `Opsi ${label} "${text}" ditambahkan`);
  return { value: text, created: true, options: await getFoodOptions() };
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
  data.settings = persistImages(Object.fromEntries(SETTINGS_KEYS.map(({ key }) => [key, String(settings[key] ?? "")])));

  return data as unknown as SaguData;
}

export async function exportData(): Promise<SaguData> {
  await logActivity("Export", "Data", "Seluruh konten diekspor ke JSON");
  return getSaguData();
}

export async function importData(raw: unknown, fileName: string): Promise<SaguData> {
  // normalizeImport dijalankan dulu: file JSON yang rusak ditolak sebelum data lama disentuh
  await replaceAllData(normalizeImport(raw));
  const data = await getSaguData();
  pruneUploads(JSON.stringify(data));
  await logActivity("Import", "Data", `Konten diimpor dari ${fileName}`);
  return data;
}

export async function resetData(): Promise<SaguData> {
  await replaceAllData(DEFAULT_DATA);
  const data = await getSaguData();
  pruneUploads(JSON.stringify(data));
  await logActivity("Reset", "Database", "Data dikembalikan ke kondisi awal");
  return data;
}
