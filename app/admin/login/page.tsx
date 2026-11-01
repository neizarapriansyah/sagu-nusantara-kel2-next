// halaman login admin ("/admin/login")
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Masuk Admin — Sagu Nusantara",
};

export default async function AdminLoginPage() {
  // sudah login, langsung ke dashboard
  if (await getSession()) redirect("/admin/dashboard");

  return <AdminLoginForm />;
}
