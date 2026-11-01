// POST /api/admin/collections/:collection : tambah data baru
import { adminRoute, readJson } from "@/lib/adminApi";
import { isCollectionKey } from "@/lib/collections";
import { ApiError } from "@/lib/errors";
import { createItem } from "@/lib/repository";

export const POST = adminRoute(async (req, { collection }) => {
  if (!isCollectionKey(collection)) throw new ApiError(404, "Menu tidak ditemukan.");
  return { item: await createItem(collection, await readJson(req)) };
});
