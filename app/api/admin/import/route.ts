// POST /api/admin/import : ganti seluruh konten dengan isi file JSON
import { adminRoute, readJson } from "@/lib/adminApi";
import { importData } from "@/lib/repository";

export const POST = adminRoute(async (req) => {
  const { fileName, data } = (await readJson(req)) as { fileName?: string; data?: unknown };
  return { data: importData(data, String(fileName ?? "file JSON")) };
});
