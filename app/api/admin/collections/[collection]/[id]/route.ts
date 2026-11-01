// PUT /api/admin/collections/:collection/:id : ubah data, DELETE : hapus data
import { adminRoute, readJson } from "@/lib/adminApi";
import { isCollectionKey } from "@/lib/collections";
import { ApiError } from "@/lib/errors";
import { deleteItem, updateItem } from "@/lib/repository";

export const PUT = adminRoute(async (req, { collection, id }) => {
  if (!isCollectionKey(collection)) throw new ApiError(404, "Menu tidak ditemukan.");
  return { item: updateItem(collection, id, await readJson(req)) };
});

export const DELETE = adminRoute((_req, { collection, id }) => {
  if (!isCollectionKey(collection)) throw new ApiError(404, "Menu tidak ditemukan.");
  deleteItem(collection, id);
  return { ok: true };
});
