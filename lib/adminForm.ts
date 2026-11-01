// fungsi bantu form admin (port dari fieldHTML, validateForm, collectValues, imageToDataURL di admin.js)
import type { AdminField } from "@/lib/adminModules";

export const MAX_UPLOAD_MB = 10;

// nilai item dari database jadi teks untuk isi form (list dipisah koma)
export function toFormValues(fields: AdminField[], item: Record<string, unknown>): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of fields) {
    const value = item[f.name];
    values[f.name] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
  }
  return values;
}

// ambil semua isi form jadi object, yang tipe list dipecah jadi array
export function collectValues(fields: AdminField[], values: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = (values[f.name] ?? "").trim();
    if (f.type === "list") result[f.name] = raw.split(",").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "number") result[f.name] = Math.max(0, parseInt(raw, 10) || 0);
    else result[f.name] = raw;
  }
  return result;
}

// cek isian wajib, isinya spasi doang juga dianggap kosong. pesan error memakai
// bubble bawaan browser (setCustomValidity + reportValidity)
export function validateForm(
  form: HTMLFormElement,
  fields: AdminField[],
  values: Record<string, string>,
): { valid: boolean; invalidImages: string[] } {
  const invalidImages: string[] = [];

  fields.forEach((f) => {
    if (f.type === "image") {
      const file = form.querySelector<HTMLInputElement>(`[data-upload="${f.name}"]`);
      const empty = Boolean(f.required) && !values[f.name];
      file?.setCustomValidity(empty ? "Pilih gambar dulu ya." : "");
      if (empty) invalidImages.push(f.name);
      return;
    }
    const el = form.elements.namedItem(f.name) as HTMLInputElement | null;
    if (el && f.required) el.setCustomValidity((values[f.name] ?? "").trim() ? "" : "Kolom ini wajib diisi.");
  });

  return { valid: form.reportValidity(), invalidImages };
}

// nama file buat ditampilin di samping tombol pilih gambar
export function imageName(src: string): string {
  if (!src) return "Belum ada gambar";
  if (src.startsWith("data:")) return "Gambar dari laptop";
  return src.split("/").pop() ?? src;
}

// ubah file gambar jadi data URL; gambarnya dikecilin dulu pakai canvas supaya
// ukuran kiriman ke server tidak kegedean
export function imageToDataURL(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const original = String(reader.result);
      // svg & gif langsung aja, kalau lewat canvas gif nya jadi diem
      if (file.type === "image/svg+xml" || file.type === "image/gif") {
        resolve(original);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("gambar tidak bisa dibaca"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // webp biar kecil tapi tetep bisa transparan
        let result = canvas.toDataURL("image/webp", 0.85);
        if (!result.startsWith("data:image/webp")) {
          result = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.85);
        }
        // kalau ternyata file aslinya udah kecil, pake yang asli aja
        resolve(scale === 1 && original.length < result.length ? original : result);
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}
