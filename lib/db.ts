// koneksi SQLite + pembuatan tabel. hanya boleh dipakai di server.
//
// skema sengaja dibuat sederhana supaya mudah dipindah ke Prisma + Postgres:
// satu tabel per koleksi, id berupa teks, urutan tampil di kolom "position",
// dan kolom daftar (bahan, makanan khas) disimpan sebagai teks JSON
// (nanti bisa jadi String[] atau Json di schema.prisma).
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_DATA } from "@/data/defaultData";
import { replaceAllData } from "@/lib/seed";

// formatnya sama dengan DATABASE_URL milik Prisma: file:./storage/sagu.db
function databasePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./storage/sagu.db";
  if (!url.startsWith("file:")) {
    throw new Error("lib/db.ts hanya mendukung SQLite (DATABASE_URL diawali file:).");
  }
  return path.resolve(process.cwd(), url.slice("file:".length));
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS about_cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS processing_steps (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS foods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    category TEXT NOT NULL,
    serving_type TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL DEFAULT '[]',
    preparation TEXT NOT NULL,
    story TEXT NOT NULL,
    fact TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    map_icon TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    foods TEXT NOT NULL DEFAULT '[]',
    facts TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS facts (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    image TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    dislikes INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  -- pilihan dropdown di form kuliner (type: wilayah | kategori | penyajian)
  CREATE TABLE IF NOT EXISTS food_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE (type, value)
  );

  -- pengaturan website, satu baris per pengaturan (siteName, tagline, dst)
  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- riwayat aktivitas admin yang tampil di ringkasan dashboard
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- penanda kecil, dipakai supaya data awal hanya dimasukkan sekali
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

function open(): Database.Database {
  const file = databasePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  // pertama kali dibuka: isi dengan data awal website (DEFAULT_DATA)
  const seeded = db.prepare("SELECT value FROM app_meta WHERE key = 'seeded'").get();
  if (!seeded) {
    replaceAllData(db, DEFAULT_DATA);
    db.prepare("INSERT INTO app_meta (key, value) VALUES ('seeded', '1')").run();
  }
  return db;
}

// koneksi disimpan di globalThis supaya tidak dibuka berulang saat hot reload di mode dev
const globalForDb = globalThis as unknown as { saguDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.saguDb) globalForDb.saguDb = open();
  return globalForDb.saguDb;
}
