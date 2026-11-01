"use client";

import { useState, type ChangeEvent } from "react";
import AdminMedia from "@/components/AdminMedia";
import type { AdminField as AdminFieldConfig } from "@/lib/adminModules";
import { MAX_UPLOAD_MB, imageName, imageToDataURL } from "@/lib/adminForm";

// value khusus buat opsi "+ Tambah ..." di dropdown
const ADD_VALUE = "__tambah__";

type AdminFieldProps = {
  field: AdminFieldConfig;
  value: string;
  idPrefix: string;
  // pilihan dropdown (hanya dipakai kalau type select)
  options?: string[];
  invalid?: boolean;
  onChange: (value: string) => void;
  // menambah pilihan dropdown baru, balikannya nilai yang harus dipilih
  onAddOption?: (field: AdminFieldConfig, text: string) => Promise<string | null>;
  // dipanggil +1 saat gambar mulai diproses dan -1 saat selesai, supaya form tidak tersimpan setengah jalan
  onBusy: (delta: 1 | -1) => void;
  onError: (message: string) => void;
};

// satu isian form. dipakai di popup tambah/edit dan di halaman pengaturan website
export default function AdminField({
  field,
  value,
  idPrefix,
  options = [],
  invalid = false,
  onChange,
  onAddOption,
  onBusy,
  onError,
}: AdminFieldProps) {
  const id = `${idPrefix}_${field.name}`;
  const req = field.required;
  const hintId = field.hint ? `${id}_hint` : undefined;

  const [uploadName, setUploadName] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addText, setAddText] = useState("");

  // dipanggil pas admin milih file di field gambar
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
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

    const oldName = uploadName;
    setUploadName("Memproses gambar…");
    onBusy(1);
    try {
      onChange(await imageToDataURL(file, field.maxSize || 1200));
      setUploadName(file.name);
      input.setCustomValidity("");
    } catch (err) {
      console.error(err);
      setUploadName(oldName);
      onError("Gambar gagal dibaca, coba pilih file lain.");
    } finally {
      onBusy(-1);
      input.value = ""; // biar file yang sama bisa dipilih lagi
    }
  }

  async function saveOption() {
    const text = addText.trim().replace(/\s+/g, " ");
    if (!text) return;
    const chosen = await onAddOption?.(field, text);
    if (!chosen) return;
    onChange(chosen);
    closeAddBox();
  }

  function closeAddBox() {
    setAdding(false);
    setAddText("");
  }

  let control;
  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          id={id}
          name={field.name}
          rows={field.rows || 4}
          required={req}
          aria-describedby={hintId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case "list":
      control = (
        <textarea
          id={id}
          name={field.name}
          rows={2}
          required={req}
          aria-describedby={hintId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case "select": {
      // nilai lama yang udah ga ada di pilihan tetep dimunculin
      const list = value && !options.includes(value) ? [value, ...options] : options;
      control = (
        <>
          <select
            id={id}
            name={field.name}
            required={req}
            value={value}
            onChange={(e) => {
              // kalau yang dipilih "+ Tambah ...", munculin kotak isian dan nilai tetap yang lama
              if (e.target.value === ADD_VALUE) setAdding(true);
              else onChange(e.target.value);
            }}
          >
            {!value && (
              <option value="" disabled>
                Pilih {field.label.toLowerCase()}
              </option>
            )}
            {list.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            {field.addable && <option value={ADD_VALUE}>+ Tambah {field.addable}</option>}
          </select>

          {field.addable && adding && (
            <div className="field__add">
              <input
                type="text"
                autoFocus
                placeholder={`Tulis ${field.addable} baru`}
                aria-label={`${field.addable} baru`}
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                // enter di kotak ini jangan sampai ke-submit formnya
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveOption();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    closeAddBox();
                  }
                }}
              />
              <button type="button" className="btn btn--primary btn--xs" onClick={saveOption}>
                Tambah
              </button>
              <button type="button" className="btn btn--outline btn--xs" onClick={closeAddBox}>
                Batal
              </button>
            </div>
          )}
        </>
      );
      break;
    }

    case "image":
      control = (
        <div className="field__image">
          <AdminMedia className="field__preview" src={value} emptyLabel="Belum ada gambar" />
          <div className="field__upload">
            <input
              type="file"
              id={id}
              accept="image/*"
              className="field__file"
              data-upload={field.name}
              aria-describedby={hintId}
              onChange={upload}
            />
            <label htmlFor={id} className="btn btn--outline btn--xs field__pick">
              {value ? "Ganti gambar" : "Pilih gambar"}
            </label>
            <span className="field__filename">{uploadName ?? imageName(value)}</span>
          </div>
        </div>
      );
      break;

    case "number":
      control = (
        <input
          type="number"
          id={id}
          name={field.name}
          min={0}
          step={1}
          inputMode="numeric"
          required={req}
          aria-describedby={hintId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    default:
      control = (
        <input
          type="text"
          id={id}
          name={field.name}
          required={req}
          aria-describedby={hintId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className={`field${field.wide ? " field--wide" : ""}${invalid ? " is-invalid" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {req && (
          <>
            {" "}
            <span className="req" aria-hidden="true">
              *
            </span>
          </>
        )}
      </label>
      {control}
      {field.hint && (
        <small className="field__hint" id={hintId}>
          {field.hint}
        </small>
      )}
    </div>
  );
}
