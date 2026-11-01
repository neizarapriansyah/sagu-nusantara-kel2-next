// fungsi tulis ke database yang dipakai bersama oleh seed awal, import JSON, dan reset
import type { Database } from "better-sqlite3";
import { COLLECTIONS, COLLECTION_KEYS, FOOD_OPTION_KEYS, SETTINGS_KEYS, type CollectionDef } from "@/lib/collections";
import type { SaguData } from "@/lib/types";

// tambah satu baris ke tabel koleksi. kolom list diubah jadi teks JSON
export function insertItem(db: Database, def: CollectionDef, item: Record<string, unknown>, position: number) {
  const columns = def.fields.map((f) => f.column);
  const params: Record<string, unknown> = { id: item.id, position };

  for (const f of def.fields) {
    const value = item[f.prop];
    params[f.column] = f.kind === "list" ? JSON.stringify(value ?? []) : f.kind === "number" ? Number(value) || 0 : String(value ?? "");
  }

  db.prepare(
    `INSERT INTO ${def.table} (id, ${columns.join(", ")}, position)
     VALUES (@id, ${columns.map((c) => "@" + c).join(", ")}, @position)`,
  ).run(params);
}

// kosongkan semua konten lalu isi dengan data yang diberikan (satu transaksi, aman kalau gagal di tengah)
export function replaceAllData(db: Database, data: SaguData) {
  db.transaction(() => {
    for (const key of COLLECTION_KEYS) {
      const def = COLLECTIONS[key];
      db.prepare(`DELETE FROM ${def.table}`).run();
      data[key].forEach((item, position) => insertItem(db, def, item as unknown as Record<string, unknown>, position));
    }

    db.prepare("DELETE FROM food_options").run();
    const addOption = db.prepare("INSERT INTO food_options (type, value, position) VALUES (?, ?, ?)");
    for (const type of FOOD_OPTION_KEYS) {
      data.foodOptions[type].forEach((value, position) => addOption.run(type, value, position));
    }

    db.prepare("DELETE FROM site_settings").run();
    const addSetting = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
    for (const { key } of SETTINGS_KEYS) addSetting.run(key, data.settings[key] ?? "");
  })();
}
