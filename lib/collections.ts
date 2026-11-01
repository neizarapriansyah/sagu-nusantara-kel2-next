// definisi tiap koleksi konten (tabel, kolom, aturan isian). dipakai server untuk
// membaca/menulis database dan memvalidasi kiriman dari dashboard admin.
import { ApiError } from "@/lib/errors";
import type { CollectionKey, FoodOptionKey, Settings } from "@/lib/types";

type FieldKind = "string" | "list" | "number";

export type CollectionField = {
  prop: string; // nama properti di objek, sama dengan tipe di lib/types.ts dan nama field di schema.prisma
  kind: FieldKind;
};

export type CollectionDef = {
  model: string; // nama model Prisma (huruf kecil di depan, seperti prisma.food)
  title: string; // nama menu, juga dicatat di riwayat aktivitas
  prefix: string; // awalan id data baru
  noAdd?: boolean;
  noDelete?: boolean;
  reorder?: boolean;
  fields: CollectionField[];
};

const str = (prop: string): CollectionField => ({ prop, kind: "string" });
const list = (prop: string): CollectionField => ({ prop, kind: "list" });
const num = (prop: string): CollectionField => ({ prop, kind: "number" });

export const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  aboutCards: {
    model: "aboutCard",
    title: "Tentang Sagu",
    prefix: "ab",
    fields: [str("title"), str("image"), str("description")],
  },
  processingSteps: {
    model: "processingStep",
    title: "Proses Pengolahan",
    prefix: "st",
    reorder: true,
    noAdd: true,
    noDelete: true,
    fields: [str("title"), str("icon"), str("image"), str("description")],
  },
  foods: {
    model: "food",
    title: "Kuliner Sagu",
    prefix: "fd",
    fields: [
      str("name"),
      str("region"),
      str("category"),
      str("servingType"),
      str("image"),
      str("description"),
      list("ingredients"),
      str("preparation"),
      str("story"),
      str("fact"),
    ],
  },
  regions: {
    model: "region",
    title: "Persebaran",
    prefix: "rg",
    fields: [
      str("name"),
      str("mapIcon"),
      str("image"),
      str("description"),
      list("foods"),
      str("facts"),
    ],
  },
  facts: {
    model: "fact",
    title: "Fakta Menarik",
    prefix: "fc",
    fields: [str("text"), str("image"), num("likes"), num("dislikes")],
  },
  quizzes: {
    model: "quiz",
    title: "Quiz",
    prefix: "qz",
    fields: [
      str("question"),
      str("optionA"),
      str("optionB"),
      str("optionC"),
      str("optionD"),
      str("correct"),
    ],
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as CollectionKey[];

export function isCollectionKey(key: string): key is CollectionKey {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, key);
}

export const FOOD_OPTION_KEYS: FoodOptionKey[] = ["wilayah", "kategori", "penyajian"];

export function isFoodOptionKey(key: unknown): key is FoodOptionKey {
  return typeof key === "string" && (FOOD_OPTION_KEYS as string[]).includes(key);
}

// kolom pengaturan website; yang required tidak boleh kosong
export const SETTINGS_KEYS: { key: keyof Settings; required: boolean }[] = [
  { key: "siteName", required: true },
  { key: "heroEyebrow", required: false },
  { key: "tagline", required: true },
  { key: "heroDescription", required: false },
  { key: "footerText", required: true },
  { key: "copyright", required: false },
  { key: "heroImage", required: true },
  { key: "footerImageLeft", required: true },
  { key: "footerImageRight", required: true },
];

// nama yang tampil di riwayat aktivitas & dialog hapus
export function itemLabel(item: Record<string, unknown>): string {
  const label = item.title || item.name || item.question || item.text;
  return typeof label === "string" && label ? label : "(tanpa judul)";
}

// teks "a, b, c" atau array jadi array bersih
export function toList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return raw.map((v) => String(v).trim()).filter(Boolean);
}

// membersihkan & memvalidasi kiriman form. semua kolom wajib terisi,
// sama seperti validasi form di versi UTS
export function cleanValues(key: CollectionKey, input: unknown): Record<string, string | number | string[]> {
  if (!input || typeof input !== "object") throw new ApiError(400, "Data yang dikirim tidak valid.");
  const source = input as Record<string, unknown>;
  const result: Record<string, string | number | string[]> = {};

  for (const field of COLLECTIONS[key].fields) {
    const value = source[field.prop];

    if (field.kind === "list") {
      const items = toList(value);
      if (!items.length) throw new ApiError(400, `Kolom ${field.prop} wajib diisi.`);
      result[field.prop] = items;
    } else if (field.kind === "number") {
      result[field.prop] = Math.max(0, parseInt(String(value ?? ""), 10) || 0);
    } else {
      const text = String(value ?? "").trim();
      if (!text) throw new ApiError(400, `Kolom ${field.prop} wajib diisi.`);
      result[field.prop] = text;
    }
  }

  if (key === "quizzes" && !["A", "B", "C", "D"].includes(String(result.correct))) {
    throw new ApiError(400, "Jawaban benar harus A, B, C, atau D.");
  }
  return result;
}

export function cleanSettings(input: unknown): Partial<Settings> {
  if (!input || typeof input !== "object") throw new ApiError(400, "Data yang dikirim tidak valid.");
  const source = input as Record<string, unknown>;
  const result: Partial<Settings> = {};

  for (const { key, required } of SETTINGS_KEYS) {
    const text = String(source[key] ?? "").trim();
    if (required && !text) throw new ApiError(400, `Kolom ${key} wajib diisi.`);
    result[key] = text;
  }
  return result;
}
