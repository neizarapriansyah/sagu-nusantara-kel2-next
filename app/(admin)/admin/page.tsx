import { redirect } from "next/navigation";

// /admin langsung diarahkan ke login (kalau sudah login, halaman login meneruskan ke dashboard)
export default function AdminIndex() {
  redirect("/admin/login");
}
