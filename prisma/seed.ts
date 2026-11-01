// isi database dengan data awal website (data/defaultData.ts). dijalankan lewat: npx prisma db seed
import "dotenv/config";
import { DEFAULT_DATA } from "@/data/defaultData";
import { prisma } from "@/lib/prisma";
import { replaceAllData } from "@/lib/seed";

async function main() {
  await replaceAllData(DEFAULT_DATA);
  await prisma.appMeta.upsert({ where: { key: "seeded" }, update: {}, create: { key: "seeded", value: "1" } });
  console.log("Data awal berhasil dimasukkan.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
