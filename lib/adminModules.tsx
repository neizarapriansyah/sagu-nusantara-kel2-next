// daftar menu konten dashboard + isian form + kolom tabelnya (port dari MODULES di admin.js).
// aturan noAdd / noDelete / reorder diambil dari lib/collections.ts supaya sama dengan yang dicek server.
import type { ReactNode } from "react";
import { COLLECTIONS, COLLECTION_KEYS } from "@/lib/collections";
import type { AdminItem, CollectionKey, FoodOptionKey, SaguData } from "@/lib/types";

export type AdminField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "list" | "select" | "image" | "number";
  required?: boolean;
  wide?: boolean;
  rows?: number;
  hint?: string;
  // maxSize = ukuran maksimal gambar (px) setelah diupload
  maxSize?: number;
  options?: string[] | ((data: SaguData) => string[]);
  // select yang pilihannya bisa ditambah admin langsung dari dropdown
  addable?: string;
  optionKey?: FoodOptionKey;
};

export type AdminColumn = {
  key: string;
  label: string;
  type?: "thumb" | "clip" | "list" | "order";
  round?: boolean;
  wide?: boolean;
  max?: number;
  // tampilan sel sendiri, menimpa tampilan bawaan sesuai type
  format?: (item: AdminItem) => ReactNode;
};

export type AdminModule = {
  title: string;
  singular: string;
  reorder?: boolean;
  noAdd?: boolean;
  noDelete?: boolean;
  fields: AdminField[];
  columns: AdminColumn[];
  // nilai awal form tambah data
  defaults?: () => Record<string, unknown>;
};

const REGION_FALLBACK = ["Papua", "Maluku", "Sulawesi", "Riau"];

export const unique = (list: string[]) => [...new Set(list.filter(Boolean))];

// angka like/dislike awal buat fakta baru, acak 1 - 10
const acak1sampai10 = () => Math.floor(Math.random() * 10) + 1;

// wilayah di dropdown kuliner: nama wilayah dari menu persebaran + tambahan dari admin
export const regionOptions = (data: SaguData): string[] => {
  const base = data.regions.length ? data.regions.map((r) => r.name) : REGION_FALLBACK;
  return unique([...base, ...data.foodOptions.wilayah]);
};

const base = (key: CollectionKey) => {
  const def = COLLECTIONS[key];
  return { title: def.title, reorder: def.reorder, noAdd: def.noAdd, noDelete: def.noDelete };
};

export const MODULES: Record<CollectionKey, AdminModule> = {
  aboutCards: {
    ...base("aboutCards"),
    singular: "kartu",
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "image", label: "Gambar", type: "image", required: true, maxSize: 1000, hint: "Pilih foto dari laptop, rasio 4:3 paling pas." },
      { name: "description", label: "Deskripsi", type: "textarea", required: true, wide: true },
    ],
    columns: [
      { key: "image", label: "Gambar", type: "thumb" },
      { key: "title", label: "Judul" },
      { key: "description", label: "Deskripsi", type: "clip" },
    ],
  },

  processingSteps: {
    ...base("processingSteps"),
    singular: "tahap",
    fields: [
      { name: "title", label: "Nama tahap", type: "text", required: true, wide: true },
      { name: "icon", label: "Ikon lingkaran", type: "image", required: true, maxSize: 300, hint: "Ikon kecil, paling bagus SVG / PNG transparan." },
      { name: "image", label: "Foto tahap", type: "image", required: true, maxSize: 1200, hint: "Foto yang tampil di samping penjelasan." },
      { name: "description", label: "Penjelasan", type: "textarea", required: true, wide: true, rows: 6 },
    ],
    columns: [
      { key: "order", label: "No", type: "order" },
      { key: "icon", label: "Ikon", type: "thumb", round: true },
      { key: "title", label: "Tahap" },
      { key: "description", label: "Penjelasan", type: "clip" },
    ],
  },

  foods: {
    ...base("foods"),
    singular: "kuliner",
    fields: [
      { name: "name", label: "Nama makanan", type: "text", required: true },
      { name: "region", label: "Wilayah", type: "select", options: regionOptions, required: true, addable: "wilayah", optionKey: "wilayah" },
      { name: "category", label: "Kategori", type: "select", options: (d) => d.foodOptions.kategori, required: true, addable: "kategori", optionKey: "kategori" },
      { name: "servingType", label: "Jenis penyajian", type: "select", options: (d) => d.foodOptions.penyajian, required: true, addable: "jenis penyajian", optionKey: "penyajian" },
      { name: "image", label: "Gambar", type: "image", required: true, wide: true, maxSize: 1000, hint: "Gunakan foto hidangan dengan rasio 4:3." },
      { name: "description", label: "Deskripsi singkat (tampil di kartu)", type: "textarea", required: true, wide: true, rows: 3 },
      { name: "ingredients", label: "Bahan utama", type: "list", required: true, wide: true, hint: "Pisahkan dengan koma" },
      { name: "preparation", label: "Cara pembuatan", type: "textarea", required: true, wide: true, rows: 3 },
      { name: "story", label: "Cerita budaya", type: "textarea", required: true, wide: true, rows: 3 },
      { name: "fact", label: "Fakta menarik", type: "textarea", required: true, wide: true, rows: 3 },
    ],
    columns: [
      { key: "image", label: "Gambar", type: "thumb" },
      { key: "name", label: "Nama" },
      { key: "region", label: "Wilayah" },
      { key: "category", label: "Kategori" },
      { key: "servingType", label: "Penyajian" },
    ],
  },

  regions: {
    ...base("regions"),
    singular: "wilayah",
    fields: [
      { name: "name", label: "Nama wilayah", type: "text", required: true, wide: true },
      { name: "mapIcon", label: "Ikon peta", type: "image", required: true, maxSize: 400, hint: "Gambar peta kecil wilayahnya." },
      { name: "image", label: "Foto wilayah", type: "image", required: true, maxSize: 1200, hint: "Foto suasana wilayahnya." },
      { name: "description", label: "Deskripsi", type: "textarea", required: true, wide: true },
      { name: "foods", label: "Makanan khas", type: "list", required: true, wide: true, hint: "Pisahkan dengan koma, contoh: Papeda, Sagu Bakar" },
      { name: "facts", label: "Fakta unik", type: "textarea", required: true, wide: true },
    ],
    columns: [
      { key: "mapIcon", label: "Peta", type: "thumb" },
      { key: "name", label: "Wilayah" },
      { key: "foods", label: "Makanan khas", type: "list" },
      { key: "description", label: "Deskripsi", type: "clip", max: 70 },
    ],
  },

  facts: {
    ...base("facts"),
    singular: "fakta",
    defaults: () => ({ likes: acak1sampai10(), dislikes: acak1sampai10() }),
    fields: [
      { name: "text", label: "Isi fakta", type: "textarea", required: true, wide: true },
      { name: "image", label: "Gambar ilustrasi", type: "image", required: true, wide: true, maxSize: 1200, hint: "Gambar yang menggambarkan faktanya, rasio 3:2 paling pas (contoh 1536 x 1024)." },
      { name: "likes", label: "Jumlah like awal", type: "number", required: true, hint: "Angka awal tombol like di website." },
      { name: "dislikes", label: "Jumlah dislike awal", type: "number", required: true, hint: "Angka awal tombol dislike di website." },
    ],
    columns: [
      { key: "order", label: "No", type: "order" },
      { key: "image", label: "Gambar", type: "thumb", wide: true },
      { key: "text", label: "Fakta", type: "clip", max: 110 },
      {
        key: "likes",
        label: "Reaksi",
        format: (f) => (
          <span className="reactions">
            <span className="reaction">
              <img src="/assets/icons/like.png" alt="Like" />
              {Number(f.likes) || 0}
            </span>
            <span className="reaction">
              <img src="/assets/icons/dislike.png" alt="Dislike" />
              {Number(f.dislikes) || 0}
            </span>
          </span>
        ),
      },
    ],
  },

  quizzes: {
    ...base("quizzes"),
    singular: "pertanyaan",
    fields: [
      { name: "question", label: "Pertanyaan", type: "textarea", required: true, wide: true, rows: 3 },
      { name: "optionA", label: "Opsi A", type: "text", required: true },
      { name: "optionB", label: "Opsi B", type: "text", required: true },
      { name: "optionC", label: "Opsi C", type: "text", required: true },
      { name: "optionD", label: "Opsi D", type: "text", required: true },
      { name: "correct", label: "Jawaban benar", type: "select", options: ["A", "B", "C", "D"], required: true },
    ],
    columns: [
      { key: "order", label: "No", type: "order" },
      { key: "question", label: "Pertanyaan", type: "clip", max: 100 },
      {
        key: "correct",
        label: "Kunci",
        format: (q) => (
          <>
            <span className="answer-key">{String(q.correct)}</span>
            {String(q["option" + q.correct] ?? "")}
          </>
        ),
      },
    ],
  },
};

// isian halaman pengaturan website
export const SETTINGS_FIELDS: AdminField[] = [
  { name: "siteName", label: "Nama website", type: "text", required: true },
  { name: "tagline", label: "Tagline", type: "text", required: true, hint: "Tampil di bawah judul hero." },
  { name: "heroEyebrow", label: "Teks kecil di atas judul hero", type: "text", wide: true },
  { name: "heroDescription", label: "Deskripsi hero", type: "textarea", wide: true },
  { name: "footerText", label: "Teks footer", type: "textarea", required: true, wide: true },
  { name: "copyright", label: "Teks hak cipta", type: "text", wide: true },
  { name: "heroImage", label: "Gambar hero", type: "image", required: true, wide: true, maxSize: 1200, hint: "Foto besar di sisi kanan hero. berbentuk potret." },
  { name: "footerImageLeft", label: "Gambar footer kiri", type: "image", required: true, maxSize: 600, hint: "Dipotong jadi persegi." },
  { name: "footerImageRight", label: "Gambar footer kanan", type: "image", required: true, maxSize: 600, hint: "Dipotong jadi persegi." },
];

export type ViewKey = "dashboard" | "settings" | CollectionKey;

// judul yang muncul di topbar, urutannya juga dipakai untuk menu sidebar
export const VIEW_META: Record<ViewKey, { title: string; group: string }> = {
  dashboard: { title: "Dashboard", group: "Ringkasan" },
  ...(Object.fromEntries(COLLECTION_KEYS.map((key) => [key, { title: MODULES[key].title, group: "Konten" }])) as Record<
    CollectionKey,
    { title: string; group: string }
  >),
  settings: { title: "Pengaturan Website", group: "Situs" },
};

export function isViewKey(value: string): value is ViewKey {
  return Object.prototype.hasOwnProperty.call(VIEW_META, value);
}
