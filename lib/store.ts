// simpan & ambil data dari localStorage (port dari SaguStore di data.js)
// hanya boleh dipanggil di browser (di dalam useEffect atau event handler)

import { DEFAULT_DATA } from "@/data/defaultData";
import { SaguLog } from "@/lib/log";
import type { CollectionKey, SaguData } from "@/lib/types";

// nama key dibedain dari UTS-Trial biar datanya ga ketuker kalau dibuka di browser yg sama
export const DB_KEY = "webSagu_db";
const VERSION_KEY = "webSagu_dbVersion";
// versi 2: nambah soal quiz qz6 - qz10
const DB_VERSION = 2;

export const COLLECTIONS: CollectionKey[] = [
  "aboutCards",
  "processingSteps",
  "foods",
  "regions",
  "facts",
  "quizzes",
];

const clone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

// angka 1-10 dari id, jadi hasilnya selalu sama tiap halaman dibuka
function angkaAwal(teks: string): number {
  let total = 0;
  for (const huruf of String(teks)) total += huruf.charCodeAt(0);
  return (total % 10) + 1;
}

// balikin true kalau berhasil, false kalau localStorage udah penuh
function save(db: SaguData): boolean {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    localStorage.setItem(VERSION_KEY, String(DB_VERSION));
    return true;
  } catch (err) {
    console.error("gagal simpan ke localStorage", err);
    return false;
  }
}

function reset(log = true): SaguData {
  const db = clone(DEFAULT_DATA);
  save(db);
  if (log) SaguLog.add("Reset", "Database", "Data dikembalikan ke kondisi awal");
  return db;
}

function load(): SaguData {
  try {
    const storedVersion = Number(localStorage.getItem(VERSION_KEY));
    const raw = localStorage.getItem(DB_KEY);
    // data versi 1 masih dipakai (biar editan admin ga hilang), cuma ditambahin soal quiz baru
    const upgradeDariV1 = storedVersion === 1;
    if (!raw || (storedVersion !== DB_VERSION && !upgradeDariV1)) return reset(false);

    const db = JSON.parse(raw) as SaguData;

    // kalau ada bagian yang hilang (misal habis import json), isi pake data awal
    COLLECTIONS.forEach((key) => {
      if (!Array.isArray(db[key])) {
        (db as unknown as Record<string, unknown>)[key] = clone(DEFAULT_DATA[key]);
      }
    });
    db.settings = { ...clone(DEFAULT_DATA.settings), ...(db.settings || {}) };

    // fakta yang kesimpen sebelum ada gambar & like/dislike dilengkapin dulu
    db.facts.forEach((f) => {
      const asal = DEFAULT_DATA.facts.find((d) => d.id === f.id);
      if (!f.image && asal) f.image = asal.image;
      if (typeof f.likes !== "number") f.likes = asal ? asal.likes : angkaAwal(f.id + "suka");
      if (typeof f.dislikes !== "number") f.dislikes = asal ? asal.dislikes : angkaAwal(f.id + "ga");
    });

    const opt: Partial<SaguData["foodOptions"]> = db.foodOptions || {};
    const foodOptions = {} as SaguData["foodOptions"];
    (Object.keys(DEFAULT_DATA.foodOptions) as (keyof SaguData["foodOptions"])[]).forEach((key) => {
      const nilai = opt[key];
      foodOptions[key] = Array.isArray(nilai) ? nilai : clone(DEFAULT_DATA.foodOptions[key]);
    });
    db.foodOptions = foodOptions;

    if (upgradeDariV1) {
      const baru = ["qz6", "qz7", "qz8", "qz9", "qz10"];
      DEFAULT_DATA.quizzes
        .filter((q) => baru.includes(q.id) && !db.quizzes.some((x) => x.id === q.id))
        .forEach((q) => db.quizzes.push(clone(q)));
      save(db);
    }
    return db;
  } catch (err) {
    console.error("data di localStorage rusak, balik ke data awal", err);
    return reset(false);
  }
}

// dipakai pas import file json dari dashboard
function importData(obj: unknown): SaguData {
  if (!obj || typeof obj !== "object") throw new Error("Format JSON tidak valid.");
  const data = obj as Record<string, unknown>;
  const missing = COLLECTIONS.filter((k) => !Array.isArray(data[k]));
  if (missing.length === COLLECTIONS.length) {
    throw new Error("File tidak berisi data Sagu Nusantara (aboutCards, foods, dst).");
  }
  if (!save(obj as SaguData)) throw new Error("penyimpanan browser penuh.");
  return load();
}

export const SaguStore = { load, save, reset, importData, COLLECTIONS, DB_KEY };
