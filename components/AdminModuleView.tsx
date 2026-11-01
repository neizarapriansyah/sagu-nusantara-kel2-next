"use client";

import { useState, type ReactNode } from "react";
import AdminMedia from "@/components/AdminMedia";
import type { AdminColumn, AdminModule } from "@/lib/adminModules";
import { itemLabel } from "@/lib/collections";
import type { AdminItem } from "@/lib/types";
import { pad } from "@/lib/util";

type AdminModuleViewProps = {
  mod: AdminModule;
  items: AdminItem[];
  onAction: (action: "add" | "edit" | "delete" | "up" | "down", id?: string) => void;
};

const ICON = {
  up: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 15l6-6 6 6" />
    </svg>
  ),
  down: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
};

const clip = (text: unknown, max = 90) => {
  const s = String(text ?? "");
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
};

// isi satu sel tabel sesuai tipe kolomnya
function cell(col: AdminColumn, item: AdminItem, index: number): ReactNode {
  if (col.format) return col.format(item);
  const value = item[col.key];

  switch (col.type) {
    case "order":
      return <span className="order-num">{pad(index + 1)}</span>;
    case "thumb":
      return (
        <AdminMedia
          className={`thumb${col.round ? " thumb--round" : ""}${col.wide ? " thumb--wide" : ""}`}
          src={String(value ?? "")}
          emptyLabel="kosong"
        />
      );
    case "clip":
      return clip(value, col.max);
    case "list":
      return ((value as string[]) || []).join(", ");
    default:
      return String(value ?? "");
  }
}

// data url gambar ga usah ikut dicari
const searchText = (item: AdminItem) =>
  Object.values(item)
    .flat()
    .filter((v) => !String(v).startsWith("data:"))
    .join(" ")
    .toLowerCase();

// halaman tabel tiap menu konten: cari, tambah, edit, hapus, dan naik/turun urutan
export default function AdminModuleView({ mod, items, onAction }: AdminModuleViewProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = q ? items.filter((item) => searchText(item).includes(q)) : items;

  // pas lagi nyari, tombol naik turun disembunyiin dulu
  const canReorder = mod.reorder && !q;

  return (
    <section className="panel">
      <div className="panel__toolbar">
        <div className="admin-search">
          <label htmlFor="moduleSearch" className="sr-only">
            Cari {mod.singular}
          </label>
          <input
            type="search"
            id="moduleSearch"
            className="input"
            placeholder={`Cari ${mod.singular}…`}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {!mod.noAdd && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onAction("add")}>
            + Tambah {mod.singular}
          </button>
        )}
      </div>

      {mod.reorder && (
        <p className="panel__note">
          Urutan di tabel ini sama dengan urutan tampil di website. Pakai tombol naik/turun untuk mengubahnya.
        </p>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {mod.columns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
              <th scope="col" className="data-table__actions">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="data-table__empty">
                <td colSpan={mod.columns.length + 1}>
                  {items.length
                    ? "Tidak ada data yang cocok dengan pencarian."
                    : `Belum ada ${mod.singular}. Klik "Tambah ${mod.singular}" untuk membuat yang pertama.`}
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const index = items.indexOf(item);
                const label = itemLabel(item);
                return (
                  <tr key={item.id}>
                    {mod.columns.map((c) => (
                      <td key={c.key} data-label={c.label}>
                        {cell(c, item, index)}
                      </td>
                    ))}
                    <td className="data-table__actions" data-label="Aksi">
                      <div className="row-actions">
                        {canReorder && (
                          <>
                            <button
                              type="button"
                              className="icon-btn"
                              data-action="up"
                              data-id={item.id}
                              aria-label={`Naikkan ${label}`}
                              disabled={index === 0}
                              onClick={() => onAction("up", item.id)}
                            >
                              {ICON.up}
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              data-action="down"
                              data-id={item.id}
                              aria-label={`Turunkan ${label}`}
                              disabled={index === items.length - 1}
                              onClick={() => onAction("down", item.id)}
                            >
                              {ICON.down}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn btn--outline btn--xs"
                          aria-label={`Edit ${label}`}
                          onClick={() => onAction("edit", item.id)}
                        >
                          Edit
                        </button>
                        {!mod.noDelete && (
                          <button
                            type="button"
                            className="btn btn--danger btn--xs"
                            aria-label={`Hapus ${label}`}
                            onClick={() => onAction("delete", item.id)}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="panel__count">
        {q ? `${rows.length} dari ${items.length} ${mod.singular} ditemukan` : `${items.length} ${mod.singular}`}
      </p>
    </section>
  );
}
