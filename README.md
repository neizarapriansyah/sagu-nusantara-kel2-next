# Sagu Nusantara (Next.js)

Konversi website Sagu Nusantara (HTML/CSS/JS) ke Next.js (App Router + TypeScript).
Front-End UTS Project - Kelompok 02.

## Cara menjalankan

1. Salin isi folder `assets/` yang lama (`icons/` dan `images/`) ke `public/assets/`,
   sehingga path-nya jadi `public/assets/images/...` dan `public/assets/icons/...`.
2. Install dan jalankan:

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
  useSaguData.ts      ambil data dari localStorage (diatur lewat dashboard admin)
  useActiveSection.ts garis bawah menu navbar mengikuti section yang tampil
lib/
  types.ts  store.ts  log.ts  util.ts   (port dari data.js)
data/
  defaultData.ts      data awal website
```

## Catatan

- Data website disimpan di `localStorage` (key `webSagu_db`), sama seperti versi HTML,
  jadi data yang diatur di dashboard admin tetap terbaca.
- Halaman admin (`/admin/login` dan `/admin/dashboard`) belum dikonversi.
