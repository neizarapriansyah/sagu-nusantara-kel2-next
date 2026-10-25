import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";

// layout khusus admin: pakai admin.css saja (tidak ikut globals.css website)
export const metadata: Metadata = {
  title: "Admin Sagu Nusantara",
  robots: { index: false, follow: false },
  icons: { icon: "/assets/images/logo-sagu.png" },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="admin-base">{children}</body>
    </html>
  );
}
