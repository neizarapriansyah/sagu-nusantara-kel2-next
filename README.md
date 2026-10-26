# Sagu Nusantara (Next.js)

Konversi halaman utama website Sagu Nusantara (HTML/CSS/JS) ke Next.js (App Router + TypeScript).
Front-End UTS Project - Kelompok 02.

Progress saat ini: **main page** sudah dikonversi. Dashboard admin belum dikonversi
(tombol pengaturan di navbar sudah tampil, tetapi belum berfungsi).

## Cara menjalankan

Gambar dan ikon sudah ada di `public/assets/` (`images/` dan `icons/`). Tinggal install dan jalankan:

```bash
npm install
npm run dev      # buka http://localhost:3000
npm run build    # build produksi
```

## Struktur

```
app/
  layout.tsx          layout global (font, metadata, globals.css)
  page.tsx            halaman utama "/" (menyusun semua section, data dikirim lewat props)
  globals.css         seluruh CSS (dari style.css)
components/
  Section.tsx         pembungkus section (memakai children)
  SectionHeading.tsx  eyebrow + judul + subjudul
  Navbar.tsx  Hero.tsx  Footer.tsx  Pembatas.tsx  Button.tsx  ChipList.tsx
  TentangSection.tsx  TentangCard.tsx
  ProsesSection.tsx   ProsesStep.tsx  ProsesDetail.tsx
  KulinerSection.tsx  KulinerCard.tsx  KulinerDropdown.tsx  KulinerModal.tsx
  PersebaranSection.tsx  WilayahButton.tsx  WilayahDetail.tsx
  FaktaSection.tsx    VoteButton.tsx
  QuizSection.tsx
hooks/
  useActiveSection.ts garis bawah menu navbar mengikuti section yang tampil
lib/
  types.ts  util.ts   (tipe data + fungsi kecil, port dari data.js)
data/
  defaultData.ts      data website (dari data.js)
```
