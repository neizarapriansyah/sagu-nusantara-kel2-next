// GET /api/admin/data : seluruh konten website
import { adminRoute } from "@/lib/adminApi";
import { getSaguData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const GET = adminRoute(() => getSaguData());
