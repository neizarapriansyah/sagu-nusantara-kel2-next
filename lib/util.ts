// fungsi kecil yang dipakai di mana-mana (dari SaguUtil di data.js)

// 1 jadi "01"
export const pad = (n: number): string => String(n).padStart(2, "0");

// data lama dari website HTML memakai path relatif ("assets/..."), jadi dibuat absolut
// supaya tetap bisa dimuat dari halaman mana pun. URL penuh dibiarkan.
export function assetSrc(src: string | undefined | null): string {
  if (!src) return "";
  if (/^(https?:|data:|blob:|\/)/.test(src)) return src;
  return `/${src}`;
}

// acak urutan (fisher-yates), dipakai untuk soal quiz
export function acak<T>(list: T[]): T[] {
  const hasil = [...list];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}
