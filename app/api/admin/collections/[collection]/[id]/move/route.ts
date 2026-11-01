// POST /api/admin/collections/:collection/:id/move : naik / turun urutan tampil
import { adminRoute, readJson } from "@/lib/adminApi";
import { isCollectionKey } from "@/lib/collections";
import { ApiError } from "@/lib/errors";
import { moveItem } from "@/lib/repository";

export const POST = adminRoute(async (req, { collection, id }) => {
  if (!isCollectionKey(collection)) throw new ApiError(404, "Menu tidak ditemukan.");

  const { direction } = (await readJson(req)) as { direction?: string };
  if (direction !== "up" && direction !== "down") throw new ApiError(400, "Arah urutan tidak valid.");
  return { items: moveItem(collection, id, direction) };
});
