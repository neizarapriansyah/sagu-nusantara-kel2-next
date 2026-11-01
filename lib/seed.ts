// fungsi tulis ke database yang dipakai bersama oleh seed awal, import JSON, dan reset
import { COLLECTIONS, COLLECTION_KEYS, FOOD_OPTION_KEYS, SETTINGS_KEYS } from "@/lib/collections";
import { prisma } from "@/lib/prisma";
import type { SaguData } from "@/lib/types";

// model Prisma dibaca secara generik (lewat nama di COLLECTIONS), jadi tipenya dibuat longgar
type Row = Record<string, unknown>;
type Delegate = {
  deleteMany(): Promise<unknown>;
  createMany(args: { data: Row[] }): Promise<unknown>;
};

// kosongkan semua konten lalu isi dengan data yang diberikan (satu transaksi, aman kalau gagal di tengah)
export async function replaceAllData(data: SaguData) {
  await prisma.$transaction(
    async (tx) => {
      const db = tx as unknown as Record<string, Delegate>;

      for (const key of COLLECTION_KEYS) {
        const delegate = db[COLLECTIONS[key].model];
        await delegate.deleteMany();
        await delegate.createMany({
          data: (data[key] as unknown as Row[]).map((item, position) => ({ ...item, position })),
        });
      }

      await tx.foodOption.deleteMany();
      await tx.foodOption.createMany({
        data: FOOD_OPTION_KEYS.flatMap((type) =>
          data.foodOptions[type].map((value, position) => ({ type, value, position })),
        ),
      });

      await tx.siteSetting.deleteMany();
      await tx.siteSetting.createMany({
        data: SETTINGS_KEYS.map(({ key }) => ({ key, value: data.settings[key] ?? "" })),
      });
    },
    // data awal cukup banyak, batas waktu bawaan 5 detik bisa terlewati di koneksi yang lambat
    { timeout: 30000, maxWait: 30000 },
  );
}
