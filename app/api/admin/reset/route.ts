// POST /api/admin/reset : kembalikan seluruh konten ke data awal
import { adminRoute } from "@/lib/adminApi";
import { resetData } from "@/lib/repository";

export const POST = adminRoute(async () => ({ data: await resetData() }));
