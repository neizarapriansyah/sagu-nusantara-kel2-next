"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SaguAuth, type Session } from "@/lib/auth";
import { SaguLog } from "@/lib/log";
import { SaguStore } from "@/lib/store";
import type { CollectionKey, SaguData } from "@/lib/types";
import { uid } from "@/lib/util";
import ConfirmDialog, { type ConfirmState } from "./ConfirmDialog";
import FormModal, { type FormConfig } from "./FormModal";
import { DashboardView, ModuleView, SettingsView } from "./Views";
import { MODULES, VIEW_META, isView, itemLabel, type Field, type Item, type ViewKey } from "./modules";

type ToastState = { message: string; type: "success" | "error" } | null;

const NAV: { group: string; items: { view: ViewKey; label: string; icon: React.ReactNode }[] }[] = [
  {
    group: "Ringkasan",
    items: [{ view: "dashboard", label: "Dashboard", icon: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></> }],
  },
  {
    group: "Konten",
    items: [
      { view: "aboutCards", label: "Tentang Sagu", icon: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></> },
      { view: "processingSteps", label: "Proses Pengolahan", icon: <><circle cx="5" cy="12" r="2.5" /><circle cx="19" cy="12" r="2.5" /><path d="M7.5 12h9" strokeDasharray="2 2" /></> },
      { view: "foods", label: "Kuliner Sagu", icon: <><path d="M3 11h18a9 9 0 0 1-18 0z" /><path d="M8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5" /></> },
      { view: "regions", label: "Persebaran", icon: <><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></> },
      { view: "facts", label: "Fakta Menarik", icon: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></> },
      { view: "quizzes", label: "Quiz", icon: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.7-.8 1.2V14" /><path d="M12 17.5v.01" /></> },
    ],
  },
  {
    group: "Situs",
    items: [{ view: "settings", label: "Pengaturan Website", icon: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></> }],
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [db, setDbState] = useState<SaguData | null>(null);
  const dbRef = useRef<SaguData | null>(null); // selalu berisi data terbaru, buat dipakai di dalam callback
  const [dbVersion, setDbVersion] = useState(0); // naik kalau data diganti dari luar (import, reset, tab lain)
  const [logTick, setLogTick] = useState(0);
  const [view, setView] = useState<ViewKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastState, setToastState] = useState<ToastState>(null);
  const [form, setForm] = useState<FormConfig | null>(null);
  const [formId, setFormId] = useState(0);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const mainRef = useRef<HTMLElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const formOpen = useRef(false);
  formOpen.current = form !== null;

  const setDb = useCallback((next: SaguData) => {
    dbRef.current = next;
    setDbState(next);
  }, []);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToastState({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState(null), type === "error" ? 5000 : 3200);
  }, []);

  // cek login + ambil data (localStorage cuma ada di browser, jadi dilakukan di useEffect)
  useEffect(() => {
    const s = SaguAuth.session();
    if (!s) {
      router.replace("/admin/login");
      return;
    }
    setSession(s);
    setDb(SaguStore.load());
  }, [router, setDb]);

  // pindah halaman pake #hash (#dashboard, #foods, dll)
  useEffect(() => {
    const go = () => {
      const h = location.hash.slice(1);
      setView(isView(h) ? h : "dashboard");
      setSidebarOpen(false);
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [session]);

  useEffect(() => {
    document.title = `${VIEW_META[view].title} — Admin Sagu Nusantara`;
  }, [view]);

  // kalau data diubah dari tab admin lain, ikut update
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SaguStore.DB_KEY) return;
      setDb(SaguStore.load());
      if (!formOpen.current) setDbVersion((v) => v + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setDb]);

  // tombol Esc nutup sidebar di layar kecil
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // semua perubahan disimpan lewat sini
  function persist(next: SaguData, action: string, moduleTitle: string, detail: string, notify = true): boolean {
    if (!SaguAuth.session()) {
      router.replace("/admin/login");
      return false;
    }
    if (!SaguStore.save(next)) {
      // localStorage penuh, balikin data ke yang terakhir kesimpen
      setDb(SaguStore.load());
      setDbVersion((v) => v + 1);
      toast("Penyimpanan browser penuh. Coba pakai gambar yang lebih kecil atau hapus data yang tidak dipakai.", "error");
      return false;
    }
    SaguLog.add(action, moduleTitle, detail);
    setDb(next);
    setLogTick((t) => t + 1);
    if (notify) toast(`${detail}.`);
    return true;
  }

  function ask(message: string, okLabel = "Hapus"): Promise<boolean> {
    return new Promise((resolve) => {
      setConfirm({ message, okLabel, resolve: (ok) => { setConfirm(null); resolve(ok); } });
    });
  }

  function openForm(config: FormConfig) {
    setFormId((n) => n + 1);
    setForm(config);
  }

  // tambah opsi dropdown baru (wilayah / kategori / penyajian) dari form kuliner
  function addOption(field: Field, text: string): boolean {
    const cur = dbRef.current!;
    if (!field.optionKey) return false;
    const next: SaguData = {
      ...cur,
      foodOptions: { ...cur.foodOptions, [field.optionKey]: [...cur.foodOptions[field.optionKey], text] },
    };
    return persist(next, "Tambah", "Kuliner Sagu", `Opsi ${field.addable} "${text}" ditambahkan`);
  }

  // ---------- export, import, reset ----------
  function exportJSON() {
    const blob = new Blob([JSON.stringify(dbRef.current, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sagu-nusantara-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    SaguLog.add("Export", "Data", "Seluruh konten diekspor ke JSON");
    setLogTick((t) => t + 1);
    toast("File JSON berhasil diunduh.");
  }

  async function importJSON(file: File) {
    try {
      const obj = JSON.parse(await file.text());
      const ok = await ask("Semua konten saat ini akan diganti dengan isi file ini. Lanjutkan import?", "Import");
      if (!ok) return;
      setDb(SaguStore.importData(obj));
      SaguLog.add("Import", "Data", `Konten diimpor dari ${file.name}`);
      setDbVersion((v) => v + 1);
      setLogTick((t) => t + 1);
      toast("Import berhasil. Konten website sudah diperbarui.");
    } catch (err) {
      const reason = err instanceof SyntaxError ? "file bukan JSON yang valid." : (err as Error).message;
      toast(`Import gagal: ${reason}`, "error");
    }
  }

  async function resetData() {
    const ok = await ask("Semua perubahan akan hilang dan konten kembali seperti data awal. Lanjutkan?", "Kembalikan");
    if (!ok) return;
    setDb(SaguStore.reset()); // log nya udah dicatat di dalam reset()
    setDbVersion((v) => v + 1);
    setLogTick((t) => t + 1);
    toast("Konten dikembalikan ke data awal.");
  }

  // ---------- semua klik tombol aksi masuk sini ----------
  async function handleAction(action: string, id?: string) {
    switch (action) {
      case "export": return exportJSON();
      case "import": return importRef.current?.click();
      case "reset": return resetData();
      case "clear-log":
        SaguLog.clear();
        return setLogTick((t) => t + 1);
    }

    if (view === "dashboard" || view === "settings") return;
    const key: CollectionKey = view;
    const mod = MODULES[key];
    if ((action === "add" && mod.noAdd) || (action === "delete" && mod.noDelete)) return;

    const list = dbRef.current![key] as unknown as Item[];
    const index = list.findIndex((x) => x.id === id);
    // ambil ulang data terbaru tiap kali mau menyimpan, siapa tau db nya udah berubah pas form kebuka
    const withList = (newList: Item[]): SaguData => ({ ...dbRef.current!, [key]: newList });

    switch (action) {
      case "add":
        openForm({
          title: `Tambah ${mod.singular}`,
          submitLabel: `Simpan ${mod.singular}`,
          fields: mod.fields,
          values: mod.defaults ? mod.defaults() : {},
          onSubmit: (values) => {
            const cur = dbRef.current![key] as unknown as Item[];
            persist(withList([...cur, { ...values, id: uid(mod.prefix) }]), "Tambah", mod.title, `${itemLabel(values)} ditambahkan`);
          },
        });
        break;

      case "edit": {
        const item = list[index];
        if (!item) return;
        openForm({
          title: `Edit ${mod.singular}`,
          submitLabel: "Simpan perubahan",
          fields: mod.fields,
          values: item,
          onSubmit: (values) => {
            const cur = dbRef.current![key] as unknown as Item[];
            const i = cur.findIndex((x) => x.id === item.id);
            if (i < 0) {
              toast("Data ini sudah tidak ada, mungkin sudah dihapus.", "error");
              return;
            }
            const copy = [...cur];
            copy[i] = { ...copy[i], ...values };
            persist(withList(copy), "Ubah", mod.title, `${itemLabel(values)} diperbarui`);
          },
        });
        break;
      }

      case "delete": {
        const item = list[index];
        if (!item) return;
        const ok = await ask(`Hapus ${mod.singular} "${itemLabel(item)}"? Tindakan ini tidak bisa dibatalkan.`);
        if (!ok) return;
        const cur = dbRef.current![key] as unknown as Item[];
        persist(withList(cur.filter((x) => x.id !== item.id)), "Hapus", mod.title, `${itemLabel(item)} dihapus`);
        break;
      }

      case "up":
      case "down": {
        const target = action === "up" ? index - 1 : index + 1;
        if (index < 0 || target < 0 || target >= list.length) return;
        const copy = [...list];
        [copy[index], copy[target]] = [copy[target], copy[index]];
        persist(withList(copy), "Urutkan", mod.title, `${itemLabel(copy[target])} dipindah ke posisi ${target + 1}`, false);
        // fokus balik ke tombol yang sama biar bisa diklik berkali-kali
        requestAnimationFrame(() =>
          document.querySelector<HTMLElement>(`[data-action="${action}"][data-id="${CSS.escape(id!)}"]`)?.focus());
        break;
      }
    }
  }

  function saveSettings(values: Item) {
    const cur = dbRef.current!;
    persist({ ...cur, settings: { ...cur.settings, ...values } }, "Ubah", "Pengaturan", "Pengaturan website diperbarui");
  }

  function logout() {
    SaguLog.add("Logout", "Auth", `${session?.user} keluar dari dashboard`);
    SaguAuth.logout();
    router.replace("/admin/login");
  }

  // belum login / data belum dimuat: jangan render apa-apa dulu (hindari kedip konten)
  if (!session || !db) return null;

  const meta = VIEW_META[view];

  return (
    <div className="admin admin-layout">
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`} id="sidebar" aria-label="Menu admin">
        <a href="#dashboard" className="brand">
          <span className="media brand__logo">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/images/logo-sagu.png" alt="" /></span>
          <span className="sidebar__brandtext">
            <span className="brand__name">Sagu Nusantara</span>
            <span className="sidebar__role">Dashboard CMS</span>
          </span>
        </a>

        <nav className="sidebar__nav" aria-label="Modul konten">
          {NAV.map((g) => (
            <div key={g.group} style={{ display: "contents" }}>
              <p className="sidebar__group">{g.group}</p>
              {g.items.map((it) => (
                <a key={it.view} href={`#${it.view}`} className="sidebar__link" data-view={it.view}
                  aria-current={view === it.view ? "page" : undefined}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">{it.icon}</svg>
                  <span>{it.label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__foot">
          <a href="/" target="_blank" rel="noopener" className="btn btn--outline btn--sm">Preview website</a>
          <button type="button" className="btn btn--primary btn--sm" onClick={logout}>Keluar</button>
        </div>
      </aside>

      <div className="sidebar-overlay" hidden={!sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <header className="topbar">
          <button type="button" className="nav-toggle" aria-controls="sidebar" aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"} onClick={() => setSidebarOpen((o) => !o)}>
            <span /><span /><span />
          </button>

          <div className="topbar__titles">
            <p className="topbar__crumb">{meta.group}</p>
            <h1 className="topbar__title">{meta.title}</h1>
          </div>

          <div className="topbar__actions">
            <span className="topbar__user">{session.user}</span>
          </div>
        </header>

        <main className="admin-content" id="view" tabIndex={-1} ref={mainRef}>
          {view === "dashboard" ? (
            <DashboardView key={`d${dbVersion}`} db={db} user={session.user} activity={logTick >= 0 ? SaguLog.all() : []} onAction={handleAction} />
          ) : view === "settings" ? (
            <SettingsView key={`s${dbVersion}`} db={db} onSave={saveSettings} toast={toast} />
          ) : (
            <ModuleView key={`${view}${dbVersion}`} moduleKey={view} db={db} onAction={handleAction} />
          )}
        </main>
      </div>

      <FormModal config={form} openId={formId} db={db} onClose={() => setForm(null)} toast={toast} onAddOption={addOption} />
      <ConfirmDialog state={confirm} />

      {toastState && (
        <div className="toast" id="toast" role="status" aria-live="polite" data-type={toastState.type}>
          {toastState.message}
        </div>
      )}

      <input ref={importRef} type="file" accept=".json,application/json" hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importJSON(file);
          e.target.value = "";
        }} />
    </div>
  );
}
