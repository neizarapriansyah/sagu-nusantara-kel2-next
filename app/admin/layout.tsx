import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";

// halaman admin tidak boleh muncul di mesin pencari
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// .admin-root membatasi seluruh CSS admin supaya tidak mengganggu tampilan website
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
