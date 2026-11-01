"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import AdminConfirm, { type ConfirmRequest } from "@/components/AdminConfirm";
import AdminFormModal, { type FormRequest } from "@/components/AdminFormModal";
import AdminModuleView from "@/components/AdminModuleView";
import AdminOverview from "@/components/AdminOverview";
import AdminSettingsView from "@/components/AdminSettingsView";
import AdminSidebar from "@/components/AdminSidebar";
import { adminFetch, errorMessage } from "@/lib/adminClient";
import { MODULES, VIEW_META, isViewKey, type AdminField, type ViewKey } from "@/lib/adminModules";
import { itemLabel } from "@/lib/collections";
import type { ActivityLog, AdminItem, CollectionKey, SaguData } from "@/lib/types";

type AdminDashboardProps = {
  initialData: SaguData;
  initialActivity: ActivityLog[];
  user: string;
};

type Toast = { message: string; type: "success" | "error" };

// seluruh dashboard admin (admin-dashboard.html + bagian DashboardPage di admin.js).
// data konten disimpan di state, setiap perubahan dikirim ke API lalu state diperbarui
export default function AdminDashboard({ initialData, initialActivity, user }: AdminDashboardProps) {
  const [data, setData] = useState(initialData);
  const [activity, setActivity] = useState(initialActivity);
  const [view, setView] = useState<ViewKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formRequest, setFormRequest] = useState<FormRequest | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  // dinaikkan setiap data diganti total (import / reset) supaya form pengaturan ikut dimuat ulang
  const [dataVersion, setDataVersion] = useState(0);

  const mainRef = useRef<HTMLElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const confirmResolver = useRef<((ok: boolean) => void) | null>(null);
  const formKey = useRef(0);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
  }, []);

  // toast hilang sendiri, yang error lebih lama supaya sempat terbaca
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.type === "error" ? 5000 : 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // pindah halaman pakai #hash (#dashboard, #foods, dll)
  useEffect(() => {
    const go = () => {
      const hash = window.location.hash.slice(1);
      setView(isViewKey(hash) ? hash : "dashboard");
      setSidebarOpen(false);
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);

  useEffect(() => {
    document.title = `${VIEW_META[view].title} — Admin Sagu Nusantara`;
  }, [view]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const loadActivity = useCallback(async () => {
    try {
      setActivity((await adminFetch<{ activity: ActivityLog[] }>("/api/admin/activity")).activity);
    } catch {
      // riwayat gagal dimuat tidak perlu mengganggu admin
    }
  }, []);

  // riwayat dimuat ulang setiap membuka ringkasan, supaya perubahan terbaru ikut tampil
  useEffect(() => {
    if (view === "dashboard") loadActivity();
  }, [view, dataVersion, loadActivity]);

  function confirm(message: string, okLabel = "Hapus"): Promise<boolean> {
    setConfirmRequest({ message, okLabel });
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
    });
  }

  function openForm(request: Omit<FormRequest, "key">) {
    setFormRequest({ ...request, key: ++formKey.current });
  }

  function setCollection(key: CollectionKey, update: (list: AdminItem[]) => AdminItem[]) {
    setData((d) => ({ ...d, [key]: update(d[key] as unknown as AdminItem[]) }));
  }

  function replaceAll(next: SaguData) {
    setData(next);
    setDataVersion((v) => v + 1);
  }

  // tambah pilihan dropdown (wilayah / kategori / penyajian) dari form kuliner
  async function addOption(field: AdminField, text: string): Promise<string | null> {
    if (!field.optionKey) return null;
    try {
      const res = await adminFetch<{ value: string; created: boolean; options: SaguData["foodOptions"] }>(
        "/api/admin/food-options",
        { method: "POST", body: { key: field.optionKey, value: text } },
      );
      setData((d) => ({ ...d, foodOptions: res.options }));
      if (res.created) showToast(`Opsi ${field.addable} "${res.value}" ditambahkan.`);
      return res.value;
    } catch (err) {
      showToast(errorMessage(err), "error");
      return null;
    }
  }

  // export, import, reset
  async function exportJSON() {
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Export gagal, coba lagi.");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `sagu-nusantara-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast("File JSON berhasil diunduh.");
      if (view === "dashboard") loadActivity();
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function importJSON(file: File) {
    try {
      const obj = JSON.parse(await file.text());
      const ok = await confirm("Semua konten saat ini akan diganti dengan isi file ini. Lanjutkan import?", "Import");
      if (!ok) return;

      const res = await adminFetch<{ data: SaguData }>("/api/admin/import", {
        method: "POST",
        body: { fileName: file.name, data: obj },
      });
      replaceAll(res.data);
      showToast("Import berhasil. Konten website sudah diperbarui.");
    } catch (err) {
      const reason = err instanceof SyntaxError ? "file bukan JSON yang valid." : errorMessage(err);
      showToast(`Import gagal: ${reason}`, "error");
    }
  }

  async function resetData() {
    const ok = await confirm("Semua perubahan akan hilang dan konten kembali seperti data awal. Lanjutkan?", "Kembalikan");
    if (!ok) return;
    try {
      replaceAll((await adminFetch<{ data: SaguData }>("/api/admin/reset", { method: "POST" })).data);
      showToast("Konten dikembalikan ke data awal.");
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function overviewAction(action: "export" | "import" | "reset" | "clear-log") {
    if (action === "export") return exportJSON();
    if (action === "import") return importRef.current?.click();
    if (action === "reset") return resetData();
    try {
      await adminFetch("/api/admin/activity", { method: "DELETE" });
      setActivity([]);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  // tombol di tabel menu konten: tambah, edit, hapus, naik, turun
  async function moduleAction(key: CollectionKey, action: "add" | "edit" | "delete" | "up" | "down", id?: string) {
    const mod = MODULES[key];
    const list = data[key] as unknown as AdminItem[];
    const item = list.find((x) => x.id === id);

    switch (action) {
      case "add":
        openForm({
          title: `Tambah ${mod.singular}`,
          submitLabel: `Simpan ${mod.singular}`,
          fields: mod.fields,
          values: mod.defaults ? mod.defaults() : {},
          onSubmit: async (values) => {
            const res = await adminFetch<{ item: AdminItem }>(`/api/admin/collections/${key}`, { method: "POST", body: values });
            setCollection(key, (l) => [...l, res.item]);
            showToast(`${itemLabel(res.item)} ditambahkan.`);
          },
        });
        break;

      case "edit":
        if (!item) return;
        openForm({
          title: `Edit ${mod.singular}`,
          submitLabel: "Simpan perubahan",
          fields: mod.fields,
          values: item,
          onSubmit: async (values) => {
            const res = await adminFetch<{ item: AdminItem }>(`/api/admin/collections/${key}/${item.id}`, {
              method: "PUT",
              body: values,
            });
            setCollection(key, (l) => l.map((x) => (x.id === item.id ? res.item : x)));
            showToast(`${itemLabel(res.item)} diperbarui.`);
          },
        });
        break;

      case "delete": {
        if (!item) return;
        const ok = await confirm(`Hapus ${mod.singular} "${itemLabel(item)}"? Tindakan ini tidak bisa dibatalkan.`);
        if (!ok) return;
        try {
          await adminFetch(`/api/admin/collections/${key}/${item.id}`, { method: "DELETE" });
          setCollection(key, (l) => l.filter((x) => x.id !== item.id));
          showToast(`${itemLabel(item)} dihapus.`);
        } catch (err) {
          showToast(errorMessage(err), "error");
        }
        break;
      }

      case "up":
      case "down":
        if (!item) return;
        try {
          const res = await adminFetch<{ items: AdminItem[] }>(`/api/admin/collections/${key}/${item.id}/move`, {
            method: "POST",
            body: { direction: action },
          });
          setCollection(key, () => res.items);
          // fokus balik ke tombol yang sama biar bisa diklik berkali-kali
          requestAnimationFrame(() =>
            document.querySelector<HTMLElement>(`[data-action="${action}"][data-id="${CSS.escape(item.id)}"]`)?.focus(),
          );
        } catch (err) {
          showToast(errorMessage(err), "error");
        }
        break;
    }
  }

  async function saveSettings(values: Record<string, unknown>) {
    const res = await adminFetch<{ settings: SaguData["settings"] }>("/api/admin/settings", { method: "PUT", body: values });
    setData((d) => ({ ...d, settings: res.settings }));
    showToast("Pengaturan website diperbarui.");
  }

  async function logout() {
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.replace("/admin/login");
    }
  }

  function renderView() {
    if (view === "dashboard") {
      return <AdminOverview data={data} user={user} activity={activity} onAction={overviewAction} />;
    }
    if (view === "settings") {
      return <AdminSettingsView key={dataVersion} settings={data.settings} onSave={saveSettings} onError={(m) => showToast(m, "error")} />;
    }
    return (
      <AdminModuleView
        key={view}
        mod={MODULES[view]}
        items={data[view] as unknown as AdminItem[]}
        onAction={(action, id) => moduleAction(view, action, id)}
      />
    );
  }

  const meta = VIEW_META[view];

  return (
    <div className="admin-layout">
      <AdminSidebar view={view} open={sidebarOpen} onLogout={logout} />

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className="admin-main">
        <header className="topbar">
          <button
            type="button"
            className="nav-toggle"
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="topbar__titles">
            <p className="topbar__crumb">{meta.group}</p>
            <h1 className="topbar__title">{meta.title}</h1>
          </div>

          <div className="topbar__actions">
            <span className="topbar__user">{user}</span>
          </div>
        </header>

        <main className="admin-content" ref={mainRef} tabIndex={-1}>
          {renderView()}
        </main>
      </div>

      <AdminFormModal
        request={formRequest}
        data={data}
        onClose={() => setFormRequest(null)}
        onAddOption={addOption}
        onError={(m) => showToast(m, "error")}
      />

      <AdminConfirm
        request={confirmRequest}
        onResolve={(ok) => {
          confirmResolver.current?.(ok);
          confirmResolver.current = null;
          setConfirmRequest(null);
        }}
      />

      {toast && (
        <div className="toast" role="status" aria-live="polite" data-type={toast.type}>
          {toast.message}
        </div>
      )}

      <input
        ref={importRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) importJSON(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
