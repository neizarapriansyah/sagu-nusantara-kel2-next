"use client";

import { useState, type ChangeEvent } from "react";
import type { SaguData } from "@/lib/types";
import { imageName, imageToDataURL, type Field, type Item } from "./modules";
import Media from "./Media";

export const ADD_VALUE = "__tambah__"; // value khusus buat opsi "+ Tambah ..." di dropdown
const MAX_UPLOAD_MB = 10;

export type FormValues = Record<string, string>;

// nilai dari data (array, angka, dst) jadi teks buat isian form
export function toFormValues(fields: Field[], source: Record<string, unknown> = {}): FormValues {
  const out: FormValues = {};
  fields.forEach((f) => {
    const v = source[f.name];
    if (f.type === "list") out[f.name] = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    else out[f.name] = v === undefined || v === null ? "" : String(v);
  });
  return out;
}

// cek isian wajib, isinya spasi doang juga dianggap kosong
export function validateForm(form: HTMLFormElement, fields: Field[], values: FormValues): boolean {
  fields.forEach((f) => {
    if (f.type === "image") {
      const file = form.querySelector<HTMLInputElement>(`[data-upload="${f.name}"]`);
      const empty = !!f.required && !values[f.name];
      file?.setCustomValidity(empty ? "Pilih gambar dulu ya." : "");
      file?.closest(".field")?.classList.toggle("is-invalid", empty);
      return;
    }
    const el = form.elements.namedItem(f.name) as HTMLInputElement | null;
    if (el && f.required) el.setCustomValidity(values[f.name].trim() ? "" : "Kolom ini wajib diisi.");
  });
  return form.reportValidity();
}

// ambil semua isi form jadi object, yang tipe list dipecah jadi array
export function collectValues(fields: Field[], values: FormValues): Item {
  const out: Record<string, unknown> = {};
  fields.forEach((f) => {
    const raw = (values[f.name] ?? "").trim();
    if (f.type === "list") out[f.name] = raw.split(",").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "number") out[f.name] = Math.max(0, parseInt(raw, 10) || 0);
    else out[f.name] = raw;
  });
  return out as Item;
}

type Props = {
  fields: Field[];
  values: FormValues;
  onChange: (name: string, value: string) => void;
  db: SaguData;
  idPrefix: string;
  onBusy: (delta: number) => void;
  onError: (message: string) => void;
  // dipanggil pas admin nambah opsi dropdown baru (wilayah / kategori / penyajian)
  onAddOption?: (field: Field, text: string) => boolean;
};

export default function FormFields({ fields, values, onChange, db, idPrefix, onBusy, onError, onAddOption }: Props) {
  return (
    <>
      {fields.map((f) => (
        <FieldControl
          key={f.name}
          field={f}
          value={values[f.name] ?? ""}
          onChange={(v) => onChange(f.name, v)}
          db={db}
          idPrefix={idPrefix}
          onBusy={onBusy}
          onError={onError}
          onAddOption={onAddOption}
        />
      ))}
    </>
  );
}

type ControlProps = {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  db: SaguData;
  idPrefix: string;
  onBusy: (delta: number) => void;
  onError: (message: string) => void;
  onAddOption?: (field: Field, text: string) => boolean;
};

function FieldControl({ field, value, onChange, db, idPrefix, onBusy, onError, onAddOption }: ControlProps) {
  const id = `${idPrefix}_${field.name}`;
  const hintId = field.hint ? `${id}_hint` : undefined;
  const required = !!field.required;

  // khusus dropdown yang bisa ditambah
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  // khusus gambar
  const [fileName, setFileName] = useState<string | null>(null);

  function addOption() {
    const text = newText.trim().replace(/\s+/g, " ");
    if (!text) return;
    const list = typeof field.options === "function" ? field.options(db) : field.options || [];
    // kalau udah ada (beda huruf besar kecil doang) pilih yang lama aja
    const same = list.find((o) => o.toLowerCase() === text.toLowerCase());
    if (same) onChange(same);
    else {
      if (!onAddOption?.(field, text)) return;
      onChange(text);
    }
    setAdding(false);
    setNewText("");
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("File yang dipilih bukan gambar.");
      input.value = "";
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      onError(`Ukuran gambar maksimal ${MAX_UPLOAD_MB} MB.`);
      input.value = "";
      return;
    }

    setFileName("Memproses gambar…");
    onBusy(1);
    try {
      const dataUrl = await imageToDataURL(file, field.maxSize || 1200);
      onChange(dataUrl);
      setFileName(file.name);
      input.setCustomValidity("");
      input.closest(".field")?.classList.remove("is-invalid");
    } catch (err) {
      console.error(err);
      setFileName(null);
      onError("Gambar gagal dibaca, coba pilih file lain.");
    } finally {
      onBusy(-1);
      input.value = ""; // biar file yang sama bisa dipilih lagi
    }
  }

  let control;
  switch (field.type) {
    case "textarea":
      control = (
        <textarea id={id} name={field.name} rows={field.rows || 4} required={required}
          aria-describedby={hintId} value={value} onChange={(e) => onChange(e.target.value)} />
      );
      break;

    case "list":
      control = (
        <textarea id={id} name={field.name} rows={2} required={required}
          aria-describedby={hintId} value={value} onChange={(e) => onChange(e.target.value)} />
      );
      break;

    case "select": {
      let options = typeof field.options === "function" ? field.options(db) : [...(field.options || [])];
      // nilai lama yang udah ga ada di pilihan tetep dimunculin
      if (value && !options.includes(value)) options = [value, ...options];
      control = (
        <>
          <select id={id} name={field.name} required={required} value={value}
            onChange={(e) => {
              // kalau yang dipilih "+ Tambah ...", munculin kotak isian
              if (e.target.value === ADD_VALUE) setAdding(true);
              else onChange(e.target.value);
            }}>
            {!value && <option value="" disabled>{`Pilih ${field.label.toLowerCase()}`}</option>}
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
            {field.addable && <option value={ADD_VALUE}>{`+ Tambah ${field.addable}`}</option>}
          </select>
          {field.addable && (
            <div className="field__add" hidden={!adding}>
              <input
                type="text"
                placeholder={`Tulis ${field.addable} baru`}
                aria-label={`${field.addable} baru`}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                // enter di kotak tambah opsi jangan sampai ke-submit formnya
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addOption(); }
                  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setAdding(false); setNewText(""); }
                }}
              />
              <button type="button" className="btn btn--primary btn--xs" onClick={addOption}>Tambah</button>
              <button type="button" className="btn btn--outline btn--xs"
                onClick={() => { setAdding(false); setNewText(""); }}>Batal</button>
            </div>
          )}
        </>
      );
      break;
    }

    case "image":
      control = (
        <div className="field__image">
          <Media src={value} className="field__preview" missingText="Belum ada gambar" />
          <div className="field__upload">
            <input type="file" id={id} accept="image/*" className="field__file"
              data-upload={field.name} aria-describedby={hintId} onChange={onFile} />
            <label htmlFor={id} className="btn btn--outline btn--xs field__pick">
              {value ? "Ganti gambar" : "Pilih gambar"}
            </label>
            <span className="field__filename">{fileName ?? imageName(value)}</span>
          </div>
          <input type="hidden" name={field.name} value={value} readOnly />
        </div>
      );
      break;

    case "number":
      control = (
        <input type="number" id={id} name={field.name} value={value} min={0} step={1}
          inputMode="numeric" required={required} aria-describedby={hintId}
          onChange={(e) => onChange(e.target.value)} />
      );
      break;

    default:
      control = (
        <input type="text" id={id} name={field.name} value={value} required={required}
          aria-describedby={hintId} onChange={(e) => onChange(e.target.value)} />
      );
  }

  return (
    <div className={`field ${field.wide ? "field--wide" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {required && <> <span className="req" aria-hidden="true">*</span></>}
      </label>
      {control}
      {field.hint && <small className="field__hint" id={hintId}>{field.hint}</small>}
    </div>
  );
}
