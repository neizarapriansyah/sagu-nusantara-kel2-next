// daftar menu konten + isian form + kolom tabelnya (port dari MODULES di admin.js)
import type { ReactNode } from "react";
import type { CollectionKey, SaguData } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item = Record<string, any> & { id: string };

export type FieldType = "text" | "textarea" | "list" | "select" | "image" | "number";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  wide?: boolean;
  rows?: number;
  hint?: string;
  maxSize?: number; // ukuran maksimal gambar (px) setelah diupload
  options?: string[] | ((db: SaguData) => string[]);
  addable?: string; // nama opsi yang boleh ditambah lewat dropdown
  optionKey?: keyof SaguData["foodOptions"];
};

export type Column = {
  key: string;
  label: string;
  type?: "order" | "thumb" | "clip" | "list";
  round?: boolean;
  wide?: boolean;
  max?: number;
  format?: (item: Item) => ReactNode;
};

export type ModuleDef = {
  title: string;
  singular: string;
  prefix: string;
  reorder?: boolean;
  noAdd?: boolean;
  noDelete?: boolean;
  defaults?: () => Record<string, unknown>;
  fields: Field[];
  columns: Column[];
};

const REGION_FALLBACK = ["Papua", "Maluku", "Sulawesi", "Riau"];
export const unique = (list: string[]) => [...new Set(list.filter(Boolean))];
const acak1sampai10 = () => Math.floor(Math.random() * 10) + 1;

export const regionOptions = (db: SaguData): string[] => {
  const base = db.regions.length ? db.regions.map((r) => r.name) : REGION_FALLBACK;
  return unique([...base, ...db.foodOptions.wilayah]);
};

export const MODULES: Record<CollectionKey, ModuleDef> = {
  aboutCards: {
    title: "Tentang Sagu",
    singular: "kartu",
    prefix: "ab",
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "image", label: "Gambar", type: "image", required: true, maxSize: 1000,
        hint: "Pilih foto dari laptop, rasio 4:3 paling pas." },
      { name: "description", label: "Deskripsi", type: "textarea", required: true, wide: true },
    ],
    columns: [
      { key: "image", label: "Gambar", type: "thumb" },
      { key: "title", label: "Judul" },
      { key: "description", label: "Deskripsi", type: "clip" },
    ],
  },

  processingSteps: {
    title: "Proses Pengolahan",
    singular: "tahap",
    prefix: "st",
    reorder: true,
    noAdd: true,
    noDelete: true,
    fields: [
      { name: "title", label: "Nama tahap", type: "text", required: true, wide: true },
      { name: "icon", label: "Ikon lingkaran", type: "image", required: true, maxSize: 300,
        hint: "Ikon kecil, paling bagus SVG / PNG transparan." },
      { name: "image", label: "Foto tahap", type: "image", required: true, maxSize: 1200,
        hint: "Foto yang tampil di samping penjelasan." },
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
    title: "Kuliner Sagu",
    singular: "kuliner",
    prefix: "fd",
    fields: [
      { name: "name", label: "Nama makanan", type: "text", required: true },
      { name: "region", label: "Wilayah", type: "select", options: regionOptions, required: true,
        addable: "wilayah", optionKey: "wilayah" },
      { name: "category", label: "Kategori", type: "select", options: (db) => db.foodOptions.kategori, required: true,
        addable: "kategori", optionKey: "kategori" },
      { name: "servingType", label: "Jenis penyajian", type: "select", options: (db) => db.foodOptions.penyajian, required: true,
        addable: "jenis penyajian", optionKey: "penyajian" },
      { name: "image", label: "Gambar", type: "image", required: true, wide: true, maxSize: 1000,
        hint: "Gunakan foto hidangan dengan rasio 4:3." },
      { name: "description", label: "Deskripsi singkat (tampil di kartu)", type: "textarea", required: true, wide: true, rows: 3 },
      { name: "ingredients", label: "Bahan utama", type: "list", required: true, wide: true,
        hint: "Pisahkan dengan koma" },
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
    title: "Persebaran",
    singular: "wilayah",
    prefix: "rg",
    fields: [
      { name: "name", label: "Nama wilayah", type: "text", required: true, wide: true },
      { name: "mapIcon", label: "Ikon peta", type: "image", required: true, maxSize: 400,
        hint: "Gambar peta kecil wilayahnya." },
      { name: "image", label: "Foto wilayah", type: "image", required: true, maxSize: 1200,
        hint: "Foto suasana wilayahnya." },
      { name: "description", label: "Deskripsi", type: "textarea", required: true, wide: true },
      { name: "foods", label: "Makanan khas", type: "list", required: true, wide: true,
        hint: "Pisahkan dengan koma, contoh: Papeda, Sagu Bakar" },
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
    title: "Fakta Menarik",
    singular: "fakta",
    prefix: "fc",
    // angka like/dislike awal buat fakta baru, acak 1 - 10
    defaults: () => ({ likes: acak1sampai10(), dislikes: acak1sampai10() }),
    fields: [
      { name: "text", label: "Isi fakta", type: "textarea", required: true, wide: true },
      { name: "image", label: "Gambar ilustrasi", type: "image", required: true, wide: true, maxSize: 1200,
        hint: "Gambar yang menggambarkan faktanya, rasio 3:2 paling pas (contoh 1536 x 1024)." },
      { name: "likes", label: "Jumlah like awal", type: "number", required: true,
        hint: "Angka awal tombol like di website." },
      { name: "dislikes", label: "Jumlah dislike awal", type: "number", required: true,
        hint: "Angka awal tombol dislike di website." },
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/like.png" alt="Like" />
              {Number(f.likes) || 0}
            </span>
            <span className="reaction">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/dislike.png" alt="Dislike" />
              {Number(f.dislikes) || 0}
            </span>
          </span>
        ),
      },
    ],
  },

  quizzes: {
    title: "Quiz",
    singular: "pertanyaan",
    prefix: "qz",
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
            <span className="answer-key">{q.correct}</span>
            {q["option" + q.correct] || ""}
          </>
        ),
      },
    ],
  },
};

// isian halaman pengaturan website
export const SETTINGS_FIELDS: Field[] = [
  { name: "siteName", label: "Nama website", type: "text", required: true },
  { name: "tagline", label: "Tagline", type: "text", required: true, hint: "Tampil di bawah judul hero." },
  { name: "heroEyebrow", label: "Teks kecil di atas judul hero", type: "text", wide: true },
  { name: "heroDescription", label: "Deskripsi hero", type: "textarea", wide: true },
  { name: "footerText", label: "Teks footer", type: "textarea", required: true, wide: true },
  { name: "copyright", label: "Teks hak cipta", type: "text", wide: true },
  { name: "heroImage", label: "Gambar hero", type: "image", required: true, wide: true, maxSize: 1200,
    hint: "Foto besar di sisi kanan hero. Bentuknya potret (tinggi), sebaiknya pakai foto tegak." },
  { name: "footerImageLeft", label: "Gambar footer kiri", type: "image", required: true, maxSize: 600,
    hint: "Dipotong jadi persegi." },
  { name: "footerImageRight", label: "Gambar footer kanan", type: "image", required: true, maxSize: 600,
    hint: "Dipotong jadi persegi." },
];

export type ViewKey = "dashboard" | "settings" | CollectionKey;

export const VIEW_META: Record<ViewKey, { title: string; group: string }> = {
  dashboard: { title: "Dashboard", group: "Ringkasan" },
  settings: { title: "Pengaturan Website", group: "Situs" },
  ...(Object.fromEntries(
    (Object.entries(MODULES) as [CollectionKey, ModuleDef][]).map(([k, m]) => [k, { title: m.title, group: "Konten" }])
  ) as Record<CollectionKey, { title: string; group: string }>),
};

export const isView = (v: string): v is ViewKey => v in VIEW_META;

// ---------- fungsi bantu ----------
export const itemLabel = (item: Record<string, unknown>): string =>
  String(item.title || item.name || item.question || item.text || "(tanpa judul)");

export const clip = (text: unknown, max = 90): string => {
  const s = String(text ?? "");
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
};

const timeFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });
export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : timeFormatter.format(d);
};

// nama file buat ditampilin di samping tombol pilih gambar
export const imageName = (src: string): string => {
  if (!src) return "Belum ada gambar";
  if (src.startsWith("data:")) return "Gambar dari laptop";
  return src.split("/").pop() || src;
};

// ubah file gambar jadi teks (data url) biar bisa disimpan di localStorage
// gambarnya dikecilin dulu pake canvas supaya ukurannya ga kegedean
export function imageToDataURL(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const original = String(reader.result);
      // svg & gif langsung aja, kalau lewat canvas gif nya jadi diem
      if (file.type === "image/svg+xml" || file.type === "image/gif") {
        resolve(original);
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error("gambar tidak bisa dibaca"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);

        // webp biar kecil tapi tetep bisa transparan
        let result = canvas.toDataURL("image/webp", 0.85);
        if (!result.startsWith("data:image/webp")) {
          result = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.85);
        }
        // kalau ternyata file aslinya udah kecil, pake yang asli aja
        resolve(scale === 1 && original.length < result.length ? original : result);
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}
