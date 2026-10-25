"use client";

import { useRef, useState, type FormEvent } from "react";
import type { CollectionKey, SaguData } from "@/lib/types";
import { SaguLog, type LogItem } from "@/lib/log";
import { pad } from "@/lib/util";
import FormFields, { collectValues, toFormValues, validateForm, type FormValues } from "./FormFields";
import Media from "./Media";
import {
  MODULES, SETTINGS_FIELDS, clip, formatTime, itemLabel, regionOptions, unique,
  type Column, type Item,
} from "./modules";

const ArrowUp = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>);
const ArrowDown = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>);

// ---------- halaman ringkasan dashboard ----------
export function DashboardView({ db, user, activity, onAction }: {
  db: SaguData; user: string; activity: LogItem[]; onAction: (action: string) => void;
}) {
  const recent = activity.slice(0, 8);

  // hitung jumlah kuliner tiap wilayah buat grafik
  const names = unique([...regionOptions(db), ...db.foods.map((f) => f.region)]);
  const counts = names.map((name) => ({ name, n: db.foods.filter((f) => f.region === name).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));

  return (
    <>
      <section className="welcome">
        <div className="welcome__text">
          <p className="welcome__eyebrow">Selamat datang kembali</p>
          <h2 className="welcome__title">Halo, {user || "admin"}!</h2>
          <p className="welcome__desc">
            Semua isi website {db.settings.siteName} bisa kamu atur dari sini, mulai dari kartu tentang sagu sampai soal quiz.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="welcome__logo" src="/assets/images/logo-sagu.png" alt="" />
      </section>

      <section className="stats" aria-label="Statistik konten">
        {(Object.keys(MODULES) as CollectionKey[]).map((key) => (
          <a className="stat" href={`#${key}`} key={key}>
            <span className="stat__num">{db[key].length}</span>
            <span className="stat__label">{MODULES[key].title}</span>
          </a>
        ))}
      </section>

      <div className="dash-grid">
        <section className="panel dash-grid__activity">
          <div className="panel__head">
            <h2 className="panel__title">Aktivitas terbaru</h2>
            {recent.length > 0 && (
              <button type="button" className="btn btn--outline btn--xs" onClick={() => onAction("clear-log")}>Bersihkan</button>
            )}
          </div>
          {recent.length ? (
            <ol className="activity">
              {recent.map((a, i) => (
                <li className="activity__item" key={a.time + i}>
                  <span className="activity__badge" data-type={a.action}>{a.action}</span>
                  <div className="activity__body">
                    <p>{a.detail}</p>
                    <small><span>{a.module}</span><time dateTime={a.time}>{formatTime(a.time)}</time></small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-note">Belum ada aktivitas. Setiap perubahan yang disimpan akan tercatat di sini.</p>
          )}
        </section>

        <section className="panel">
          <h2 className="panel__title">Kuliner per wilayah</h2>
          <ul className="bars">
            {counts.map((c) => (
              <li className="bar" key={c.name}>
                <span className="bar__label">{c.name}</span>
                <span className="bar__track"><span className="bar__fill" style={{ width: `${(c.n / max) * 100}%` }} /></span>
                <span className="bar__value">{c.n}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2 className="panel__title">Kelola data</h2>
          <p className="panel__note">Simpan cadangan seluruh konten sebagai file JSON, atau pulihkan dari file cadangan.</p>
          <div className="data-tools">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => onAction("export")}>Export JSON</button>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => onAction("import")}>Import JSON</button>
            <button type="button" className="btn btn--danger btn--sm" onClick={() => onAction("reset")}>Kembalikan data awal</button>
          </div>
        </section>
      </div>
    </>
  );
}

// ---------- halaman tabel tiap menu konten ----------
function Cell({ col, item, index }: { col: Column; item: Item; index: number }) {
  if (col.format) return <>{col.format(item)}</>;
  const value = item[col.key];
  switch (col.type) {
    case "order":
      return <span className="order-num">{pad(index + 1)}</span>;
    case "thumb":
      return <Media src={value} className={`thumb ${col.round ? "thumb--round" : ""} ${col.wide ? "thumb--wide" : ""}`} missingText="kosong" />;
    case "clip":
      return <>{clip(value, col.max)}</>;
    case "list":
      return <>{((value as string[]) || []).join(", ")}</>;
    default:
      return <>{value}</>;
  }
}

export function ModuleView({ moduleKey, db, onAction }: {
  moduleKey: CollectionKey; db: SaguData; onAction: (action: string, id?: string) => void;
}) {
  const mod = MODULES[moduleKey];
  const [query, setQuery] = useState("");
  const all = db[moduleKey] as unknown as Item[];

  // data url gambar ga usah ikut dicari
  const searchText = (item: Item) =>
    Object.values(item).flat().filter((v) => !String(v).startsWith("data:")).join(" ").toLowerCase();
  const q = query.trim().toLowerCase();
  const rows = q ? all.filter((item) => searchText(item).includes(q)) : all;
  // pas lagi nyari, tombol naik turun disembunyiin dulu
  const canReorder = mod.reorder && !q;

  return (
    <section className="panel">
      <div className="panel__toolbar">
        <div className="admin-search">
          <label htmlFor="moduleSearch" className="sr-only">Cari {mod.singular}</label>
          <input type="search" id="moduleSearch" className="input" placeholder={`Cari ${mod.singular}…`}
            autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {!mod.noAdd && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onAction("add")}>
            + Tambah {mod.singular}
          </button>
        )}
      </div>

      {mod.reorder && (
        <p className="panel__note">Urutan di tabel ini sama dengan urutan tampil di website. Pakai tombol naik/turun untuk mengubahnya.</p>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {mod.columns.map((c) => <th scope="col" key={c.key}>{c.label}</th>)}
              <th scope="col" className="data-table__actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="data-table__empty">
                <td colSpan={mod.columns.length + 1}>
                  {all.length
                    ? "Tidak ada data yang cocok dengan pencarian."
                    : `Belum ada ${mod.singular}. Klik "Tambah ${mod.singular}" untuk membuat yang pertama.`}
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const index = all.indexOf(item);
                const label = itemLabel(item);
                return (
                  <tr key={item.id}>
                    {mod.columns.map((c) => (
                      <td data-label={c.label} key={c.key}><Cell col={c} item={item} index={index} /></td>
                    ))}
                    <td className="data-table__actions" data-label="Aksi">
                      <div className="row-actions">
                        {canReorder && (
                          <>
                            <button type="button" className="icon-btn" data-action="up" data-id={item.id}
                              aria-label={`Naikkan ${label}`} disabled={index === 0}
                              onClick={() => onAction("up", item.id)}><ArrowUp /></button>
                            <button type="button" className="icon-btn" data-action="down" data-id={item.id}
                              aria-label={`Turunkan ${label}`} disabled={index === all.length - 1}
                              onClick={() => onAction("down", item.id)}><ArrowDown /></button>
                          </>
                        )}
                        <button type="button" className="btn btn--outline btn--xs" aria-label={`Edit ${label}`}
                          onClick={() => onAction("edit", item.id)}>Edit</button>
                        {!mod.noDelete && (
                          <button type="button" className="btn btn--danger btn--xs" aria-label={`Hapus ${label}`}
                            onClick={() => onAction("delete", item.id)}>Hapus</button>
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
        {q ? `${rows.length} dari ${all.length} ${mod.singular} ditemukan` : `${all.length} ${mod.singular}`}
      </p>
    </section>
  );
}

// ---------- halaman pengaturan website ----------
export function SettingsView({ db, onSave, toast }: {
  db: SaguData;
  onSave: (values: Item) => void;
  toast: (message: string, type?: "success" | "error") => void;
}) {
  const [values, setValues] = useState<FormValues>(() =>
    toFormValues(SETTINGS_FIELDS, db.settings as unknown as Record<string, unknown>));
  const [busy, setBusy] = useState(0); // jumlah gambar yang lagi diproses
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) {
      toast("Tunggu sebentar, gambar masih diproses.", "error");
      return;
    }
    if (!validateForm(e.currentTarget, SETTINGS_FIELDS, values)) return;
    onSave(collectValues(SETTINGS_FIELDS, values));
  }

  return (
    <section className="panel">
      <h2 className="panel__title">Identitas website</h2>
      <p className="panel__note">Perubahan di sini langsung dipakai di navbar, hero, dan footer website.</p>
      <form ref={formRef} id="settingsForm" noValidate onSubmit={onSubmit}
        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity?.("")}>
        <div className="form-grid">
          <FormFields
            fields={SETTINGS_FIELDS}
            values={values}
            onChange={(name, v) => setValues((cur) => ({ ...cur, [name]: v }))}
            db={db}
            idPrefix="sf"
            onBusy={(d) => setBusy((n) => n + d)}
            onError={(m) => toast(m, "error")}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary btn--sm">Simpan pengaturan</button>
        </div>
      </form>
    </section>
  );
}

export const readActivity = (): LogItem[] => SaguLog.all();
