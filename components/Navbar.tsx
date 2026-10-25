"use client";

import Link from "next/link";
import { useActiveSection } from "@/hooks/useActiveSection";

type NavbarProps = {
  siteName: string;
};

const NAV_ITEMS = [
  { id: "beranda", label: "Beranda" },
  { id: "tentang-sagu", label: "Tentang Sagu" },
  { id: "proses-pengolahan", label: "Proses Pengolahan" },
  { id: "kuliner-sagu", label: "Kuliner Sagu" },
  { id: "persebaran", label: "Persebaran" },
  { id: "quiz", label: "Quiz" },
] as const;

const NAV_IDS = NAV_ITEMS.map((item) => item.id);

export default function Navbar({ siteName }: NavbarProps) {
  const active = useActiveSection(NAV_IDS);

  return (
    <header className="site-header">
      <div className="navbar">
        <a href="#beranda" className="brand">
          <img src="/assets/images/logo-sagu.png" alt="Logo Sagu Nusantara" className="brand-logo" />
          <span className="brand-name">{siteName}</span>
        </a>

        <nav className="nav-menu">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link${active === item.id ? " active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/admin/login"
          className="settings-button"
          aria-label="Masuk ke dashboard admin"
          title="Dashboard admin"
        >
          <svg className="settings-icon" viewBox="0 0 24 24">
            <path d="M19.4 13a7.8 7.8 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a8.2 8.2 0 0 0-1.7-1L15 3.3h-4L10.6 6a8.2 8.2 0 0 0-1.7 1L6.4 6l-2 3.4L6.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a8.2 8.2 0 0 0 1.7 1l.4 2.7h4l.4-2.7a8.2 8.2 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
