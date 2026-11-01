// halaman dashboard admin ("/admin/dashboard"), hanya bisa dibuka setelah login
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { getSession } from "@/lib/auth";
import { getActivity, getSaguData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Admin Sagu Nusantara",
};

export default async function AdminDashboardPage() {
  // belum login atau sesi habis, lempar ke halaman login
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return <AdminDashboard initialData={getSaguData()} initialActivity={getActivity()} user={session.user} />;
}
