"use client";

import { useState, type FormEvent } from "react";
import AdminField from "@/components/AdminField";
import { SETTINGS_FIELDS } from "@/lib/adminModules";
import { collectValues, toFormValues, validateForm } from "@/lib/adminForm";
import type { Settings } from "@/lib/types";

type AdminSettingsViewProps = {
  settings: Settings;
  onSave: (values: Record<string, unknown>) => Promise<void>;
  onError: (message: string) => void;
};

// halaman pengaturan website: nama, tagline, teks hero, teks footer, dan gambar hero/footer
export default function AdminSettingsView({ settings, onSave, onError }: AdminSettingsViewProps) {
  const [values, setValues] = useState(() => toFormValues(SETTINGS_FIELDS, settings as unknown as Record<string, unknown>));
  const [invalidImages, setInvalidImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(0); // jumlah gambar yang lagi diproses
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) {
      onError("Tunggu sebentar, gambar masih diproses.");
      return;
    }

    const { valid, invalidImages: invalid } = validateForm(e.currentTarget, SETTINGS_FIELDS, values);
    setInvalidImages(invalid);
    if (!valid) return;

    setSaving(true);
    try {
      await onSave(collectValues(SETTINGS_FIELDS, values));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel__title">Identitas website</h2>
      <p className="panel__note">Perubahan di sini langsung dipakai di navbar, hero, dan footer website.</p>
      <form noValidate onSubmit={submit} onInput={(e) => (e.target as HTMLInputElement).setCustomValidity?.("")}>
        <div className="form-grid">
          {SETTINGS_FIELDS.map((field) => (
            <AdminField
              key={field.name}
              field={field}
              idPrefix="sf"
              value={values[field.name] ?? ""}
              invalid={invalidImages.includes(field.name)}
              onChange={(value) => {
                setValues((v) => ({ ...v, [field.name]: value }));
                setInvalidImages((list) => list.filter((n) => n !== field.name));
              }}
              onBusy={(delta) => setBusy((n) => n + delta)}
              onError={onError}
            />
          ))}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
            Simpan pengaturan
          </button>
        </div>
      </form>
    </section>
  );
}
