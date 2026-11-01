import { Fragment, type ReactNode } from "react";
import AdminMedia from "@/components/AdminMedia";
import { VIEW_META, type ViewKey } from "@/lib/adminModules";

type AdminSidebarProps = {
  view: ViewKey;
  open: boolean;
  onLogout: () => void;
};

// ikon tiap menu sidebar
const ICONS: Record<ViewKey, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  aboutCards: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19V5" />
    </>
  ),
  processingSteps: (
    <>
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
      <path d="M7.5 12h9" strokeDasharray="2 2" />
    </>
  ),
  foods: (
    <>
      <path d="M3 11h18a9 9 0 0 1-18 0z" />
      <path d="M8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5" />
    </>
  ),
  regions: (
    <>
      <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  facts: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </>
  ),
  quizzes: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.7-.8 1.2V14" />
      <path d="M12 17.5v.01" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
};

// menu dikelompokkan sesuai group di VIEW_META (Ringkasan, Konten, Situs)
const GROUPS: { label: string; views: ViewKey[] }[] = [
  { label: "Ringkasan", views: ["dashboard"] },
  { label: "Konten", views: ["aboutCards", "processingSteps", "foods", "regions", "facts", "quizzes"] },
  { label: "Situs", views: ["settings"] },
];

export default function AdminSidebar({ view, open, onLogout }: AdminSidebarProps) {
  return (
    <aside className={`sidebar${open ? " is-open" : ""}`} id="sidebar" aria-label="Menu admin">
      <a href="#dashboard" className="brand">
        <AdminMedia className="brand__logo" src="/assets/images/logo-sagu.png" />
        <span className="sidebar__brandtext">
          <span className="brand__name">Sagu Nusantara</span>
          <span className="sidebar__role">Dashboard CMS</span>
        </span>
      </a>

      <nav className="sidebar__nav" aria-label="Modul konten">
        {GROUPS.map((group) => (
          <Fragment key={group.label}>
            <p className="sidebar__group">{group.label}</p>
            {group.views.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="sidebar__link"
                aria-current={view === key ? "page" : undefined}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS[key]}
                </svg>
                <span>{VIEW_META[key].title}</span>
              </a>
            ))}
          </Fragment>
        ))}
      </nav>

      <div className="sidebar__foot">
        <a href="/" target="_blank" rel="noopener" className="btn btn--outline btn--sm">
          Preview website
        </a>
        <button type="button" className="btn btn--primary btn--sm" onClick={onLogout}>
          Keluar
        </button>
      </div>
    </aside>
  );
}
