// GET /api/admin/export : unduh seluruh konten sebagai file JSON
import { adminRoute } from "@/lib/adminApi";
import { exportData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => {
  const body = JSON.stringify(await exportData(), null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sagu-nusantara-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});
