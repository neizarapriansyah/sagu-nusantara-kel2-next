# Sagu Nusantara (Next.js)

Konversi website Sagu Nusantara (HTML/CSS/JS) ke Next.js (App Router + TypeScript), lengkap dengan dashboard admin.
Front-End UTS Project - Kelompok 02.

Progress saat ini: **main page** dan **dashboard admin** sudah dikonversi. Data website sekarang
disimpan di **Postgres (Supabase) lewat Prisma**, bukan lagi `localStorage`.

## Cara menjalankan

Gambar dan ikon sudah ada di `public/assets/` (`images/` dan `icons/`). Tinggal install dan jalankan:

```bash
npm install
npm run dev      # buka http://localhost:3000
npm run build    # build produksi
```

### Setup database (sekali saja)

1. Salin `.env.example` jadi `.env`, lalu isi `DATABASE_URL` dan `DIRECT_URL` dari Supabase
   (Project Settings → Database → Connection string).
2. Terapkan tabel ke database dan isi data awal:

```bash
npx prisma migrate deploy   # membuat tabel sesuai folder prisma/migrations
npx prisma db seed          # mengisi data awal dari data/defaultData.ts
```

Folder `generated/` (client Prisma) dibuat otomatis oleh `npm install` (script `postinstall`).
Kalau mengubah `prisma/schema.prisma`, jalankan `npm run db:migrate` lalu commit folder `prisma/migrations`.

## Dashboard admin

- Login: `/admin/login` (atau ikon gerigi di navbar). Akun bawaan sama seperti versi UTS:
  username `admin`, password `sagu123` (ganti lewat `ADMIN_USERNAME` / `ADMIN_PASSWORD` di `.env`).
- Dashboard: `/admin/dashboard`, berpindah menu lewat `#hash` seperti versi UTS.
- Fitur sama dengan versi UTS: CRUD semua konten, upload gambar (otomatis dikecilkan), tambah opsi
  dropdown, urutan tahap proses, pengaturan website, ringkasan + aktivitas, export / import / reset JSON.
- Gambar upload disimpan sebagai file di `storage/uploads/` dan dilayani lewat `/api/uploads/...`.
- Sesi login memakai cookie httpOnly bertanda tangan (berlaku 8 jam). Ganti `SESSION_SECRET` saat deploy.

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
app/admin/
  layout.tsx          pembungkus .admin-root + admin.css (CSS admin dibatasi supaya tidak bentrok)
  login/page.tsx      halaman login
  dashboard/page.tsx  halaman dashboard (sesi dicek di server)
app/api/
  admin/...           route API admin (login, logout, data, collections, settings, import, dst)
  uploads/[name]      melayani gambar upload
components/ (admin)
  AdminDashboard.tsx  AdminSidebar.tsx  AdminOverview.tsx  AdminModuleView.tsx  AdminSettingsView.tsx
  AdminFormModal.tsx  AdminField.tsx  AdminConfirm.tsx  AdminLoginForm.tsx  AdminMedia.tsx
lib/
  types.ts  util.ts   (tipe data + fungsi kecil, port dari data.js)
  prisma.ts seed.ts   koneksi Prisma + fungsi isi ulang data
  repository.ts       seluruh query database (semua fungsi async)
  collections.ts      definisi tabel/kolom + validasi kiriman form
  auth.ts uploads.ts  sesi login, penyimpanan gambar upload
  adminApi.ts adminClient.ts  pembungkus route API (server) dan pemanggil API (browser)
  adminModules.tsx adminForm.ts  konfigurasi menu/form/tabel dashboard + fungsi form
prisma/
  schema.prisma  seed.ts  migrations/   skema Postgres, data awal, riwayat migrasi
prisma.config.ts      konfigurasi Prisma CLI
data/
  defaultData.ts      data website (dari data.js)
```
