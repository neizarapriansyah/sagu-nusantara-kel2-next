// GET /api/admin/activity : riwayat aktivitas terbaru, DELETE : bersihkan riwayat
import { adminRoute } from "@/lib/adminApi";
import { clearActivity, getActivity } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => ({ activity: await getActivity() }));

export const DELETE = adminRoute(async () => {
  await clearActivity();
  return { ok: true };
});
