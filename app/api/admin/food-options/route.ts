// POST /api/admin/food-options : tambah pilihan wilayah / kategori / penyajian dari dropdown form kuliner
import { adminRoute, readJson } from "@/lib/adminApi";
import { isFoodOptionKey } from "@/lib/collections";
import { ApiError } from "@/lib/errors";
import { addFoodOption } from "@/lib/repository";

export const POST = adminRoute(async (req) => {
  const { key, value } = (await readJson(req)) as { key?: unknown; value?: unknown };
  if (!isFoodOptionKey(key)) throw new ApiError(400, "Jenis opsi tidak valid.");
  return await addFoodOption(key, value);
});
