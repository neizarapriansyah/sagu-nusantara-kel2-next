// PUT /api/admin/settings : simpan pengaturan website
import { adminRoute, readJson } from "@/lib/adminApi";
import { updateSettings } from "@/lib/repository";

export const PUT = adminRoute(async (req) => ({ settings: await updateSettings(await readJson(req)) }));
