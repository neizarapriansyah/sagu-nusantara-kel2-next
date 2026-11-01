"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import AdminField from "@/components/AdminField";
import type { AdminField as AdminFieldConfig } from "@/lib/adminModules";
import { collectValues, toFormValues, validateForm } from "@/lib/adminForm";
import type { SaguData } from "@/lib/types";

// permintaan membuka form. key harus beda tiap kali dibuka supaya isian form mulai dari awal
export type FormRequest = {
  key: number;
  title: string;
  submitLabel: string;
  fields: AdminFieldConfig[];
  values: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

type AdminFormModalProps = {
  request: FormRequest | null;
  data: SaguData;
  onClose: () => void;
  onAddOption: (field: AdminFieldConfig, text: string) => Promise<string | null>;
  onError: (message: string) => void;
};

// popup form tambah / edit data, memakai elemen <dialog> bawaan browser
export default function AdminFormModal({ request, data, onClose, onAddOption, onError }: AdminFormModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (request && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("input:not([type=file]):not([type=hidden]), textarea, select")?.focus();
    }
    if (!request && dialog.open) dialog.close();
  }, [request]);

  return (
    <dialog ref={ref} className="admin-dialog" aria-labelledby="formTitle" onClose={onClose}>
      {request && (
        <FormBody
          key={request.key}
          request={request}
          data={data}
          onClose={() => ref.current?.close()}
          onAddOption={onAddOption}
          onError={onError}
        />
      )}
    </dialog>
  );
}

type FormBodyProps = {
  request: FormRequest;
  data: SaguData;
  onClose: () => void;
  onAddOption: AdminFormModalProps["onAddOption"];
  onError: (message: string) => void;
};

function FormBody({ request, data, onClose, onAddOption, onError }: FormBodyProps) {
  const { fields } = request;
  const [values, setValues] = useState(() => toFormValues(fields, request.values));
  const [invalidImages, setInvalidImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(0); // jumlah gambar yang lagi diproses
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) {
      onError("Tunggu sebentar, gambar masih diproses.");
      return;
    }

    const { valid, invalidImages: invalid } = validateForm(e.currentTarget, fields, values);
    setInvalidImages(invalid);
    if (!valid) return;

    // popup baru ditutup kalau server berhasil menyimpan, kalau gagal isian tetap ada
    setSaving(true);
    try {
      await request.onSubmit(collectValues(fields, values));
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Gagal menyimpan data.");
      setSaving(false);
    }
  }

  return (
    <form
      className="dialog-form"
      noValidate
      onSubmit={submit}
      // setiap mengetik, pesan error bawaan browser dihapus
      onInput={(e) => (e.target as HTMLInputElement).setCustomValidity?.("")}
    >
      <div className="batik-strip" role="presentation"></div>
      <div className="dialog-head">
        <h2 id="formTitle">{request.title}</h2>
        <button type="button" className="dialog-close" aria-label="Tutup form" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="dialog-body">
        <div className="form-grid">
          {fields.map((field) => {
            const options =
              field.type !== "select" ? undefined : typeof field.options === "function" ? field.options(data) : field.options;
            return (
              <AdminField
                key={field.name}
                field={field}
                idPrefix="ef"
                value={values[field.name] ?? ""}
                options={options}
                invalid={invalidImages.includes(field.name)}
                onChange={(value) => {
                  setValues((v) => ({ ...v, [field.name]: value }));
                  setInvalidImages((list) => list.filter((n) => n !== field.name));
                }}
                onAddOption={onAddOption}
                onBusy={(delta) => setBusy((n) => n + delta)}
                onError={onError}
              />
            );
          })}
        </div>
      </div>
      <div className="dialog-actions">
        <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {request.submitLabel}
        </button>
      </div>
    </form>
  );
}
