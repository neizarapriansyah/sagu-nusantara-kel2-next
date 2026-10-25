"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SaguData } from "@/lib/types";
import FormFields, { collectValues, toFormValues, validateForm, type FormValues } from "./FormFields";
import type { Field, Item } from "./modules";

export type FormConfig = {
  title: string;
  submitLabel: string;
  fields: Field[];
  values: Record<string, unknown>;
  onSubmit: (values: Item) => void;
};

type Props = {
  config: FormConfig | null;
  openId: number; // naik tiap form dibuka, supaya isian selalu mulai dari awal
  db: SaguData;
  onClose: () => void;
  toast: (message: string, type?: "success" | "error") => void;
  onAddOption: (field: Field, text: string) => boolean;
};

// popup form tambah / edit
export default function FormModal({ config, openId, db, onClose, toast, onAddOption }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (config && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>("input:not([type=file]):not([type=hidden]), textarea, select")?.focus();
    }
    if (!config && d.open) d.close();
  }, [config, openId]);

  return (
    <dialog ref={dialogRef} className="admin-dialog" id="formModal" aria-labelledby="formTitle"
      onClose={onClose}
      onClick={(e) => { if ((e.target as HTMLElement).closest("[data-close]")) dialogRef.current?.close(); }}>
      {config && <FormBody key={openId} config={config} db={db} toast={toast} onAddOption={onAddOption}
        close={() => dialogRef.current?.close()} />}
    </dialog>
  );
}

function FormBody({ config, db, toast, onAddOption, close }: {
  config: FormConfig; db: SaguData; close: () => void;
  toast: Props["toast"]; onAddOption: Props["onAddOption"];
}) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(config.fields, config.values));
  const [busy, setBusy] = useState(0); // jumlah gambar yang lagi diproses

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) {
      toast("Tunggu sebentar, gambar masih diproses.", "error");
      return;
    }
    if (!validateForm(e.currentTarget, config.fields, values)) return;
    const result = collectValues(config.fields, values);
    close();
    config.onSubmit(result);
  }

  return (
    <form className="dialog-form" id="entityForm" noValidate onSubmit={onSubmit}
      onInput={(e) => (e.target as HTMLInputElement).setCustomValidity?.("")}>
      <div className="batik-strip" role="presentation" />
      <div className="dialog-head">
        <h2 id="formTitle">{config.title}</h2>
        <button type="button" className="dialog-close" data-close aria-label="Tutup form">×</button>
      </div>
      <div className="dialog-body">
        <div className="form-grid">
          <FormFields
            fields={config.fields}
            values={values}
            onChange={(name, v) => setValues((cur) => ({ ...cur, [name]: v }))}
            db={db}
            idPrefix="ef"
            onBusy={(d) => setBusy((n) => n + d)}
            onError={(m) => toast(m, "error")}
            onAddOption={onAddOption}
          />
        </div>
      </div>
      <div className="dialog-actions">
        <button type="button" className="btn btn--outline btn--sm" data-close>Batal</button>
        <button type="submit" className="btn btn--primary btn--sm">{config.submitLabel}</button>
      </div>
    </form>
  );
}
