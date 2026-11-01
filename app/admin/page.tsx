import { redirect } from "next/navigation";

// "/admin" langsung ke dashboard (kalau belum login, dashboard melempar ke halaman login)
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
