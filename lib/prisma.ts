// koneksi Prisma ke Prisma Postgres. hanya boleh dipakai di server.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createClient(): PrismaClient {
  const url = new URL(process.env.DATABASE_URL ?? "");
  // jaga-jaga: parameter pgbouncer (dari connection string lama) tidak dikenal driver pg
  url.searchParams.delete("pgbouncer");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url.toString() }) });
}

// disimpan di globalThis supaya hot reload di mode dev tidak membuka koneksi baru terus-menerus
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
